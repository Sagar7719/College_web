import { NextRequest, NextResponse } from 'next/server';
import { navigationService } from '@/services/navigation.service';
import { NavigationItem } from '@/types';
import { requireAdmin, handleApiAuthError } from '@/lib/firebase/session';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope') || 'admin';

    if (scope === 'public') {
      const items = await navigationService.getNavigationItems();
      return NextResponse.json({ success: true, data: items });
    }

    // Admin scope or any non-public scope requires administrator authorization
    await requireAdmin();
    const items = await navigationService.getAllAdminNavigationItems();
    return NextResponse.json({ success: true, data: items });
  } catch (error: unknown) {
    const authResponse = handleApiAuthError(error);
    if (authResponse) return authResponse;

    return NextResponse.json(
      { success: false, error: 'Failed to fetch navigation items.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce server-side administrator authorization
    await requireAdmin();

    const body = await req.json();

    if (body.action === 'sync_page') {
      const { cmsPageId, title, slug, visible, order, isSystemPage, systemKey, parentId } = body;
      await navigationService.syncPageToNavigation(
        cmsPageId,
        title,
        slug,
        visible,
        order,
        isSystemPage,
        systemKey,
        parentId
      );
      return NextResponse.json({ success: true, message: 'Page synced to navigation.' });
    }

    if (body.action === 'remove_page') {
      const { cmsPageId } = body;
      await navigationService.removePageNavigationCompletely(cmsPageId);
      return NextResponse.json({ success: true, message: 'Page navigation removed.' });
    }

    // Default POST: Save navigation items sequence array
    const items: NavigationItem[] = Array.isArray(body) ? body : body.items;
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ success: false, error: 'Invalid items array.' }, { status: 400 });
    }

    await navigationService.saveNavigationItems(items);
    return NextResponse.json({ success: true, message: 'Navigation saved successfully.' });
  } catch (error: unknown) {
    const authResponse = handleApiAuthError(error);
    if (authResponse) return authResponse;

    return NextResponse.json(
      { success: false, error: 'Failed to save navigation.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // 1. Enforce server-side administrator authorization
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing item id.' }, { status: 400 });
    }

    await navigationService.deleteNavigationItem(id);
    return NextResponse.json({ success: true, message: `Navigation item deleted successfully.` });
  } catch (error: unknown) {
    const authResponse = handleApiAuthError(error);
    if (authResponse) return authResponse;

    return NextResponse.json(
      { success: false, error: 'Failed to delete navigation item.' },
      { status: 500 }
    );
  }
}
