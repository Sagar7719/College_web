import { NextRequest, NextResponse } from 'next/server';
import { siteSettingsService } from '@/services/site-settings.service';
import { SiteSettings } from '@/types/site-settings';
import { requireAdmin, handleApiAuthError } from '@/lib/firebase/session';

export async function GET() {
  try {
    const settings = await siteSettingsService.getSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch site settings.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce server-side administrator authorization
    await requireAdmin();

    const body: Partial<SiteSettings> = await req.json();
    await siteSettingsService.updateSettings(body);
    return NextResponse.json({ success: true, message: 'Site settings updated successfully.' });
  } catch (error: unknown) {
    const authResponse = handleApiAuthError(error);
    if (authResponse) return authResponse;

    return NextResponse.json(
      { success: false, error: 'Failed to update site settings.' },
      { status: 500 }
    );
  }
}
