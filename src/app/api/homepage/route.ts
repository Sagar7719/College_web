import { NextRequest, NextResponse } from 'next/server';
import { homepageConfigService } from '@/services/enterprise-cms.service';
import { HomepageConfigData } from '@/types/enterprise-cms';
import { requireAdmin, handleApiAuthError } from '@/lib/firebase/session';

export async function GET() {
  try {
    const data = await homepageConfigService.get();
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch homepage configuration.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body: HomepageConfigData = await req.json();
    await homepageConfigService.save(body);
    return NextResponse.json({ success: true, message: 'Homepage configuration updated successfully.' });
  } catch (error: unknown) {
    const authResponse = handleApiAuthError(error);
    if (authResponse) return authResponse;

    return NextResponse.json(
      { success: false, error: 'Failed to update homepage configuration.' },
      { status: 500 }
    );
  }
}
