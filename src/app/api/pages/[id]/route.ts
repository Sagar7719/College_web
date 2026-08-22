import { NextRequest, NextResponse } from 'next/server';
import { pagesService } from '@/services/pages.service';
import { requireAdmin, handleApiAuthError } from '@/lib/firebase/session';

interface Context {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const page = await pagesService.getPageById(id);
    if (!page) {
      return NextResponse.json({ success: false, error: 'Page not found.' }, { status: 404 });
    }

    // If page is not published, verify administrator authorization
    if (page.status !== 'published') {
      await requireAdmin();
    }

    return NextResponse.json({ success: true, data: page });
  } catch (error: unknown) {
    const authResponse = handleApiAuthError(error);
    if (authResponse) return authResponse;

    return NextResponse.json(
      { success: false, error: 'Failed to fetch page.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: Context) {
  try {
    // 1. Enforce server-side administrator authorization
    await requireAdmin();

    const { id } = await params;
    const body = await req.json();
    if (!body.title || !body.slug) {
      return NextResponse.json({ success: false, error: 'Page title and slug are required.' }, { status: 400 });
    }
    const savedId = await pagesService.savePage({
      ...body,
      id,
      title: body.title,
      slug: body.slug,
    });
    return NextResponse.json({ success: true, id: savedId, message: 'Page updated successfully.' });
  } catch (error: unknown) {
    const authResponse = handleApiAuthError(error);
    if (authResponse) return authResponse;

    return NextResponse.json(
      { success: false, error: 'Failed to update page.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  try {
    // 1. Enforce server-side administrator authorization
    await requireAdmin();

    const { id } = await params;
    await pagesService.deletePage(id);
    return NextResponse.json({ success: true, message: `Page permanently deleted.` });
  } catch (error: unknown) {
    const authResponse = handleApiAuthError(error);
    if (authResponse) return authResponse;

    return NextResponse.json(
      { success: false, error: 'Failed to delete page.' },
      { status: 500 }
    );
  }
}
