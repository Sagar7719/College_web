import { NextRequest, NextResponse } from 'next/server';
import { pagesService } from '@/services/pages.service';
import { Page } from '@/types';
import {
  requireAdmin,
  verifyFirebaseSessionCookie,
  handleApiAuthError,
} from '@/lib/firebase/session';

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

    // Broad query without slug or id: check administrator claims
    const claims = await verifyFirebaseSessionCookie();
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

    const body: Partial<Page> = await req.json();
    if (!body.title || !body.slug) {
      return NextResponse.json({ success: false, error: 'Page title and slug are required.' }, { status: 400 });
    }
    const savedId = await pagesService.savePage({
      ...body,
      title: body.title,
      slug: body.slug,
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
