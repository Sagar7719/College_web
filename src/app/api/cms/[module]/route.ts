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

const moduleServices: Record<ValidModule, any> = {
  notices: noticesService,
  news: newsService,
  events: eventsService,
  courses: coursesService,
  departments: departmentsService,
  faculty: facultyService,
  gallery: galleryService,
  downloads: downloadsService,
};

// Zod schema lookup — one schema per valid module
const moduleSchemas: Record<ValidModule, { safeParse: (data: unknown) => { success: boolean; data?: any; error?: any } }> = {
  notices: noticeSchema,
  news: newsSchema,
  events: eventSchema,
  courses: courseSchema,
  departments: departmentSchema,
  faculty: facultySchema,
  gallery: gallerySchema,
  downloads: downloadSchema,
};

function isValidModule(module: string): module is ValidModule {
  return VALID_CMS_MODULES.includes(module as ValidModule);
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

    const service = moduleServices[module];
    const { searchParams } = new URL(req.url);
    const publishedOnly = searchParams.get('published') === 'true';

    // Clamp limit to [1, 100] to prevent unbounded or zero-cost queries
    const rawLimit = searchParams.get('limit');
    const limitCount: number | undefined = rawLimit !== null
      ? Math.min(100, Math.max(1, parseInt(rawLimit, 10) || 1))
      : undefined;

    // Helper to retrieve published-only records safely
    const fetchPublishedOnly = async () => {
      if (typeof service.getPublished === 'function') {
        return await service.getPublished(limitCount);
      }
      if (typeof service.getUpcoming === 'function') {
        return await service.getUpcoming();
      }
      const all = await service.getAll();
      const published = all.filter(
        (item: any) => item.status === 'published' || item.status === undefined
      );
      return limitCount ? published.slice(0, limitCount) : published;
    };

    if (publishedOnly) {
      const data = await fetchPublishedOnly();
      return NextResponse.json({ success: true, data });
    }

    // Broad request without ?published=true: verify if caller is an administrator
    const claims = await verifyFirebaseSessionCookie();
    if (claims && claims.admin === true) {
      const data = await service.getAll();
      return NextResponse.json({ success: true, data });
    }

    // Unauthenticated or non-admin requests receive only published items to prevent draft leakage
    const data = await fetchPublishedOnly();
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
    // 1. Enforce server-side administrator authorization first
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
    // 1. Enforce server-side administrator authorization first
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
