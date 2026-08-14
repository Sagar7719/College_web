import { NextRequest, NextResponse } from 'next/server';
import { pagesService } from '@/services/pages.service';
import { Page } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');

    if (slug !== null) {
      const page = await pagesService.getPageBySlug(slug);
      return NextResponse.json({ success: true, data: page });
    }

    if (id !== null) {
      const page = await pagesService.getPageById(id);
      return NextResponse.json({ success: true, data: page });
    }

    const allPages = await pagesService.getAllPages();
    return NextResponse.json({ success: true, data: allPages });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: Partial<Page> = await req.json();
    if (!body.title || !body.slug) {
      return NextResponse.json({ success: false, error: 'Page title and slug are required' }, { status: 400 });
    }
    const savedId = await pagesService.savePage({
      ...body,
      title: body.title,
      slug: body.slug,
    });
    return NextResponse.json({ success: true, id: savedId, message: 'Page saved successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save page' },
      { status: 500 }
    );
  }
}
