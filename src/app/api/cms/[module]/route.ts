import { NextRequest, NextResponse } from 'next/server';
import {
  noticesService,
  newsService,
  eventsService,
  coursesService,
  departmentsService,
  facultyService,
  galleryService,
  downloadsService,
} from '@/services/cms-modules.service';
import { getAdminDb } from '@/lib/firebase/admin';
import {
  requireAdmin,
  verifyFirebaseSessionCookie,
  handleApiAuthError,
} from '@/lib/firebase/session';
import {
  departmentSchema,
  courseSchema,
  facultySchema,
  noticeSchema,
  newsSchema,
  eventSchema,
  gallerySchema,
  downloadSchema,
} from '@/validations/cms-modules.schema';

interface Context {
  params: Promise<{
    module: string;
  }>;
}

const VALID_CMS_MODULES = [
  'notices',
  'news',
  'events',
  'courses',
  'departments',
  'faculty',
  'gallery',
  'downloads',
] as const;

type ValidModule = (typeof VALID_CMS_MODULES)[number];

/**
 * Per-module read configuration for the Admin SDK path.
 * orderField: field to sort by server-side (must match existing index).
 * orderDir: 'asc' | 'desc'
 * statusField: field name used to filter published items (undefined = no status field / always visible).
 * eventsOrderField: events sort by eventDate ascending.
 */
const MODULE_READ_CONFIG: Record<
  ValidModule,
  { orderField: string; orderDir: 'asc' | 'desc'; statusField: string }
> = {
  notices:     { orderField: 'publishDate', orderDir: 'desc', statusField: 'status' },
  news:        { orderField: 'publishDate', orderDir: 'desc', statusField: 'status' },
  events:      { orderField: 'eventDate',   orderDir: 'asc',  statusField: 'status' },
  courses:     { orderField: 'title',       orderDir: 'asc',  statusField: 'status' },
  departments: { orderField: 'order',       orderDir: 'asc',  statusField: 'status' },
  faculty:     { orderField: 'order',       orderDir: 'asc',  statusField: 'status' },
  gallery:     { orderField: 'createdAt',   orderDir: 'desc', statusField: 'status' },
  downloads:   { orderField: 'createdAt',   orderDir: 'desc', statusField: 'status' },
};

// Zod schema lookup — one schema per valid module (used for POST validation)
const moduleSchemas: Record<
  ValidModule,
  { safeParse: (data: unknown) => { success: boolean; data?: any; error?: any } }
> = {
  notices:     noticeSchema,
  news:        newsSchema,
  events:      eventSchema,
  courses:     courseSchema,
  departments: departmentSchema,
  faculty:     facultySchema,
  gallery:     gallerySchema,
  downloads:   downloadSchema,
};

// Service lookup — used for POST/DELETE (write operations via client SDK, server-side is fine for writes)
const moduleServices: Record<ValidModule, any> = {
  notices:     noticesService,
  news:        newsService,
  events:      eventsService,
  courses:     coursesService,
  departments: departmentsService,
  faculty:     facultyService,
  gallery:     galleryService,
  downloads:   downloadsService,
};

function isValidModule(module: string): module is ValidModule {
  return VALID_CMS_MODULES.includes(module as ValidModule);
}

/**
 * Reads all documents from a CMS collection using Firebase Admin SDK (server-side gRPC).
 * This is significantly faster than the Web Client SDK in Node.js because Admin SDK
 * uses native gRPC transport instead of WebChannel HTTP long-polling.
 *
 * Results are sorted in-memory after fetch to avoid composite index requirements.
 */
async function adminReadCollection(
  collectionName: string,
  config: { orderField: string; orderDir: 'asc' | 'desc'; statusField: string },
  publishedOnly: boolean,
  maxItems?: number
): Promise<Record<string, unknown>[]> {
  const adminDb = getAdminDb();
  const snapshot = await adminDb.collection(collectionName).get();

  let docs = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));

  // Filter published items if requested
  if (publishedOnly && config.statusField) {
    docs = docs.filter((d) => {
      const status = (d as any)[config.statusField];
      // Include items without a status field (treated as published) or explicitly published
      return status === 'published' || status === undefined;
    });
  }

  // Sort in-memory using the configured field
  docs.sort((a, b) => {
    const aVal = (a as any)[config.orderField] ?? '';
    const bVal = (b as any)[config.orderField] ?? '';
    if (config.orderDir === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });

  // Apply limit if specified
  if (maxItems !== undefined) {
    docs = docs.slice(0, maxItems);
  }

  return docs;
}

export async function GET(req: NextRequest, { params }: Context) {
  try {
    const { module } = await params;

    if (!module || !isValidModule(module)) {
      return NextResponse.json(
        { success: false, error: 'Invalid CMS module.' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const publishedOnly = searchParams.get('published') === 'true';

    // Clamp limit to [1, 100] to prevent unbounded or zero-result queries
    const rawLimit = searchParams.get('limit');
    const limitCount: number | undefined =
      rawLimit !== null
        ? Math.min(100, Math.max(1, parseInt(rawLimit, 10) || 1))
        : undefined;

    const config = MODULE_READ_CONFIG[module];

    if (publishedOnly) {
      // Public published-only request: no auth required, fetch published items only
      const data = await adminReadCollection(module, config, true, limitCount);
      return NextResponse.json({ success: true, data });
    }

    // Broad request without ?published=true: check if admin to decide all vs published.
    // Fast local JWT verification (checkRevoked=false) is appropriate here because:
    //   - This is a read-only operation — no mutation, no security-sensitive action.
    //   - Even if a token were somehow revoked between requests, the worst outcome is
    //     the admin temporarily sees draft items. The next mutation call uses requireAdmin()
    //     which retains strict checkRevoked=true.
    //   - checkRevoked=true adds an external HTTPS round-trip to Google on every read request,
    //     which is the primary performance bottleneck for admin pages.
    const claims = await verifyFirebaseSessionCookie(undefined, false);
    if (claims && claims.admin === true) {
      // Authenticated admin: return all documents regardless of status
      const data = await adminReadCollection(module, config, false, limitCount);
      return NextResponse.json({ success: true, data });
    }

    // Unauthenticated or non-admin: return only published items to prevent draft leakage
    const data = await adminReadCollection(module, config, true, limitCount);
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const authResponse = handleApiAuthError(error);
    if (authResponse) return authResponse;

    return NextResponse.json(
      { success: false, error: 'Failed to fetch module data.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: Context) {
  try {
    // 1. Enforce server-side administrator authorization first (strict checkRevoked for mutations)
    await requireAdmin();

    const { module } = await params;
    if (!module || !isValidModule(module)) {
      return NextResponse.json(
        { success: false, error: 'Invalid CMS module.' },
        { status: 400 }
      );
    }

    const service = moduleServices[module];
    const raw = await req.json();

    // 2. Runtime schema validation — select the correct schema for the validated module
    const schema = moduleSchemas[module];
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Invalid module data.';
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    const savedId = await service.save(parsed.data);

    return NextResponse.json({
      success: true,
      id: savedId,
      message: 'Item saved successfully.',
    });
  } catch (error: unknown) {
    const authResponse = handleApiAuthError(error);
    if (authResponse) return authResponse;

    return NextResponse.json(
      { success: false, error: 'Failed to save item.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  try {
    // 1. Enforce server-side administrator authorization first (strict checkRevoked for mutations)
    await requireAdmin();

    const { module } = await params;
    if (!module || !isValidModule(module)) {
      return NextResponse.json(
        { success: false, error: 'Invalid CMS module.' },
        { status: 400 }
      );
    }

    const service = moduleServices[module];
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing item id.' },
        { status: 400 }
      );
    }

    if (typeof service.delete === 'function') {
      await service.delete(id);
    } else if (typeof service.save === 'function') {
      await service.save({ id, status: 'archived' });
    }

    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully.',
    });
  } catch (error: unknown) {
    const authResponse = handleApiAuthError(error);
    if (authResponse) return authResponse;

    return NextResponse.json(
      { success: false, error: 'Failed to delete item.' },
      { status: 500 }
    );
  }
}
