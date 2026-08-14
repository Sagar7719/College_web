import { NextRequest, NextResponse } from 'next/server';
import { homepageConfigService } from '@/services/enterprise-cms.service';
import { HomepageConfigData } from '@/types/enterprise-cms';

export async function GET() {
  try {
    const data = await homepageConfigService.get();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch homepage configuration' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: HomepageConfigData = await req.json();
    await homepageConfigService.save(body);
    return NextResponse.json({ success: true, message: 'Homepage configuration updated successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update homepage configuration' },
      { status: 500 }
    );
  }
}
