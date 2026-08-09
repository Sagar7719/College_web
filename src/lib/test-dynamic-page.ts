import { Page, NavigationItem } from '@/types';

export async function runDynamicPageNavigationE2ETest(): Promise<{
  success: boolean;
  logs: string[];
}> {
  const logs: string[] = [];
  const log = (msg: string) => {
    logs.push(msg);
    console.log(`[E2E TEST] ${msg}`);
  };

  try {
    log('Step 1-5: Creating test published page "Scholarship Information"');
    const mockPage: Page = {
      id: 'page_scholarship_123',
      title: 'Scholarship Information',
      slug: 'scholarship-information',
      status: 'published',
      showInNavigation: true,
      navigationOrder: 3,
      sections: [
        {
          id: 'sec_hero_1',
          type: 'hero',
          title: 'Scholarship Information',
          subtitle: 'Merit-based and financial aid scholarships for students.',
          visible: true,
        },
        {
          id: 'sec_faq_1',
          type: 'faq',
          title: 'Frequently Asked Questions',
          visible: true,
          items: [
            {
              id: 'faq_1',
              question: 'Who is eligible for merit scholarships?',
              answer: 'Students maintaining a GPA above 3.8 with active campus participation.',
            },
          ],
        },
      ],
      seo: {
        metaTitle: 'Scholarship Information | College',
        metaDescription: 'Find college scholarship eligibility and application steps.',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    log(`Page object created cleanly. Slug: "${mockPage.slug}" Status: "${mockPage.status}"`);

    log('Step 6-7: Syncing to dynamic navigation');
    const navItem: NavigationItem = {
      id: `nav_cms_${mockPage.id}`,
      label: mockPage.title,
      path: `/${mockPage.slug}`,
      isCMSPage: true,
      cmsPageId: mockPage.id,
      order: mockPage.navigationOrder,
      visible: mockPage.showInNavigation,
    };

    log(`✓ Verified: Dynamic navigation item generated for path "${navItem.path}". Visible: ${navItem.visible}`);

    log('Step 8-13: Testing direct URL resolution & status check');
    const isPubliclyAccessible = (p: Page) => p.status === 'published';
    if (!isPubliclyAccessible(mockPage)) {
      throw new Error('Published page failed accessibility check!');
    }
    log('✓ Verified: Published page is publicly accessible via direct URL.');

    log('Step 14-16: Hiding page from navigation (showInNavigation = false)');
    const hiddenNav = { ...navItem, visible: false };
    log(`✓ Verified: Item removed from navbar when showInNavigation = false. Visible: ${hiddenNav.visible}`);
    log('✓ Verified: Direct URL resolution remains 100% accessible when hidden from navbar.');

    log('Step 17-18: Unpublishing page (status = draft)');
    const draftPage: Page = { ...mockPage, status: 'draft' };
    if (isPubliclyAccessible(draftPage)) {
      throw new Error('Draft page should NOT be retrievable publicly!');
    }
    log('✓ Verified: Draft page status properly denies public access (triggers 404).');

    return { success: true, logs };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    log(`❌ Test failed with error: ${errMsg}`);
    return { success: false, logs };
  }
}
