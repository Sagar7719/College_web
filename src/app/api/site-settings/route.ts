import { NextRequest, NextResponse } from 'next/server';
import { siteSettingsService } from '@/services/site-settings.service';
import { SiteSettings } from '@/types/site-settings';

export async function GET() {
  try {
    const settings = await siteSettingsService.getSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch site settings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: Partial<SiteSettings> = await req.json();
    await siteSettingsService.updateSettings(body);
    return NextResponse.json({ success: true, message: 'Site settings updated successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update site settings' },
      { status: 500 }
    );
  }
}
