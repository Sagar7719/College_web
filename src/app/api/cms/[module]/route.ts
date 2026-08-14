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

interface Context {
  params: Promise<{
    module: string;
  }>;
}

const moduleServices: Record<string, any> = {
  notices: noticesService,
  news: newsService,
  events: eventsService,
  courses: coursesService,
  departments: departmentsService,
  faculty: facultyService,
  gallery: galleryService,
  downloads: downloadsService,
};

export async function GET(req: NextRequest, { params }: Context) {
  try {
    const { module } = await params;
    const service = moduleServices[module];

    if (!service) {
      return NextResponse.json({ success: false, error: `Invalid CMS module: ${module}` }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const publishedOnly = searchParams.get('published') === 'true';
    const limitCount = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;

    let data;
    if (publishedOnly && typeof service.getPublished === 'function') {
      data = await service.getPublished(limitCount);
    } else {
      data = await service.getAll();
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch module data' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: Context) {
  try {
    const { module } = await params;
    const service = moduleServices[module];

    if (!service) {
      return NextResponse.json({ success: false, error: `Invalid CMS module: ${module}` }, { status: 400 });
    }

    const body = await req.json();
    const savedId = await service.save(body);
    return NextResponse.json({ success: true, id: savedId, message: `${module} item saved successfully` });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || `Failed to save ${module} item` },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  try {
    const { module } = await params;
    const service = moduleServices[module];

    if (!service) {
      return NextResponse.json({ success: false, error: `Invalid CMS module: ${module}` }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing item id' }, { status: 400 });
    }

    if (typeof service.delete === 'function') {
      await service.delete(id);
    } else if (typeof service.save === 'function') {
      await service.save({ id, status: 'archived' });
    }

    return NextResponse.json({ success: true, message: `${module} item ${id} deleted` });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || `Failed to delete ${module} item` },
      { status: 500 }
    );
  }
}
