import { NextRequest, NextResponse } from 'next/server';
import { pagesService } from '@/services/pages.service';
import { requireAdmin, handleApiAuthError } from '@/lib/firebase/session';
import { pageFormSchema } from '@/validations/page.schema';

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
    const raw = await req.json();

    // 2. Runtime schema validation — pageFormSchema.partial() allows update payloads
    //    that omit optional fields while still enforcing enum values, slug format, and string lengths.
    const parsed = pageFormSchema.partial().safeParse(raw);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Invalid page data.';
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    const savedId = await pagesService.savePage({
      ...parsed.data,
      id,
      // savePage() requires { title: string; slug: string }; provide '' defaults
      // so the service can merge with the existing Firestore document values.
      title: parsed.data.title ?? '',
      slug: parsed.data.slug ?? '',
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
