import { NextRequest, NextResponse } from 'next/server';
import { pagesService } from '@/services/pages.service';
import {
  requireAdmin,
  verifyFirebaseSessionCookie,
  handleApiAuthError,
} from '@/lib/firebase/session';
import { pageFormSchema } from '@/validations/page.schema';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');

    if (slug !== null) {
      const page = await pagesService.getPageBySlug(slug);
      if (!page) {
        return NextResponse.json({ success: false, error: 'Page not found.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: page });
    }

    if (id !== null) {
      const page = await pagesService.getPageById(id);
      if (!page) {
        return NextResponse.json({ success: false, error: 'Page not found.' }, { status: 404 });
      }
      // If page is not published, verify administrator authorization
      if (page.status !== 'published') {
        await requireAdmin();
      }
      return NextResponse.json({ success: true, data: page });
    }

    // Broad query without slug or id: check administrator claims (fast local JWT verification for read-only check)
    const claims = await verifyFirebaseSessionCookie(undefined, false);
    if (claims && claims.admin === true) {
      const allPages = await pagesService.getAllPages();
      return NextResponse.json({ success: true, data: allPages });
    }

    // Unauthenticated callers receive only published pages to prevent draft leakage
    const publishedPages = await pagesService.getPublishedPages();
    return NextResponse.json({ success: true, data: publishedPages });
  } catch (error: unknown) {
    const authResponse = handleApiAuthError(error);
    if (authResponse) return authResponse;

    return NextResponse.json(
      { success: false, error: 'Failed to fetch pages.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce server-side administrator authorization
    await requireAdmin();

    const raw = await req.json();

    // 2. Runtime schema validation — rejects malformed, incomplete, or invalid-status payloads
    const parsed = pageFormSchema.safeParse(raw);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Invalid page data.';
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    const savedId = await pagesService.savePage({
      ...parsed.data,
    });
    return NextResponse.json({ success: true, id: savedId, message: 'Page saved successfully.' });
  } catch (error: unknown) {
    const authResponse = handleApiAuthError(error);
    if (authResponse) return authResponse;

    return NextResponse.json(
      { success: false, error: 'Failed to save page.' },
      { status: 500 }
    );
  }
}
