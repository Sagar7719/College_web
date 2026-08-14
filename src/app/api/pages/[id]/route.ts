import { NextRequest, NextResponse } from 'next/server';
import { pagesService } from '@/services/pages.service';

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
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: page });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch page' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const body = await req.json();
    if (!body.title || !body.slug) {
      return NextResponse.json({ success: false, error: 'Page title and slug are required' }, { status: 400 });
    }
    const savedId = await pagesService.savePage({
      ...body,
      id,
      title: body.title,
      slug: body.slug,
    });
    return NextResponse.json({ success: true, id: savedId, message: 'Page updated successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update page' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    await pagesService.deletePage(id);
    return NextResponse.json({ success: true, message: `Page ${id} permanently deleted` });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete page' },
      { status: 500 }
    );
  }
}
