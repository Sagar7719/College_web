import { NextRequest, NextResponse } from 'next/server';
import { siteSettingsService } from '@/services/site-settings.service';
import { SiteSettings } from '@/types/site-settings';
import { requireAdmin, handleApiAuthError } from '@/lib/firebase/session';
import { siteSettingsSchema } from '@/validations/site-settings.schema';

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

    const raw = await req.json();

    // 2. Runtime schema validation — .partial() makes all top-level keys optional,
    //    modelling merge-update semantics. Sub-object fields remain validated if present.
    const parsed = siteSettingsSchema.partial().safeParse(raw);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Invalid site settings data.';
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    await siteSettingsService.updateSettings(parsed.data as Partial<SiteSettings>);
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
