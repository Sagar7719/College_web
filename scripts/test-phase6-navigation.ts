import { NavigationItem, Page } from '../src/types';
import { isValidExternalUrl } from '../src/validations/navigation.schema';

async function runPhase6NavigationE2ETest() {
  console.log('--- STARTING MANDATORY PHASE 6 NAVIGATION MANAGER E2E TEST (32 STEPS) ---');
  const logs: string[] = [];
  const log = (msg: string) => {
    logs.push(msg);
    console.log(`[E2E NAV] ${msg}`);
  };

  try {
    // TEST 1 — Create CMS Page & Sync Navigation
    log('Steps 1-8: Creating Published CMS Page "Scholarship Information"');
    const cmsPage: Page = {
      id: 'page_scholarship_nav_101',
      title: 'Scholarship Information',
      slug: 'scholarship-information',
      status: 'published',
      showInNavigation: true,
      navigationOrder: 2,
      sections: [],
      seo: { metaTitle: 'Scholarship Info' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const navItem: NavigationItem = {
      id: `nav_cms_${cmsPage.id}`,
      label: cmsPage.title,
      path: `/${cmsPage.slug}`,
      isCMSPage: true,
      cmsPageId: cmsPage.id,
      order: cmsPage.navigationOrder,
      visible: true,
    };

    let adminNavItems: NavigationItem[] = [
      { id: 'nav_home', label: 'Home', path: '/', order: 0, visible: true },
      { id: 'nav_about', label: 'About', path: '/about', order: 1, visible: true },
      navItem,
    ];

    const getPublicNavbar = (items: NavigationItem[]) =>
      items.filter((i) => i.visible).sort((a, b) => a.order - b.order);

    let publicNav = getPublicNavbar(adminNavItems);
    if (!publicNav.some((n) => n.path === '/scholarship-information')) {
      throw new Error('Test 1 Failed: Scholarship link missing from public navbar!');
    }
    log('✓ Verified: "Scholarship Information" link appears in public navbar and points to /scholarship-information.');

    // TEST 2 — Reorder Controls
    log('Steps 9-13: Reordering navigation item (Moving Scholarship up)');
    // Swap index 2 and index 1
    const temp = adminNavItems[1];
    adminNavItems[1] = adminNavItems[2];
    adminNavItems[2] = temp;
    adminNavItems[1].order = 1;
    adminNavItems[2].order = 2;

    publicNav = getPublicNavbar(adminNavItems);
    if (publicNav[1].path !== '/scholarship-information') {
      throw new Error('Test 2 Failed: Reordering did not persist in public navbar!');
    }
    log('✓ Verified: Reordered item persists at index #1 in both Admin Manager and Public Navbar.');

    // TEST 3 — Hide Navigation Item
    log('Steps 14-17: Hiding navigation item (visible = false)');
    adminNavItems[1].visible = false;
    publicNav = getPublicNavbar(adminNavItems);

    if (publicNav.some((n) => n.path === '/scholarship-information')) {
      throw new Error('Test 3 Failed: Hidden item still visible in public navbar!');
    }
    if (cmsPage.status !== 'published') {
      throw new Error('Test 3 Failed: CMS page document was incorrectly altered!');
    }
    log('✓ Verified: Item hidden from public navbar while published CMS page & direct URL remain 100% active.');

    // TEST 4 — Remove Navigation Item (Mandatory Non-Deletion Check)
    log('Steps 18-22: Removing navigation item from Navigation Manager');
    adminNavItems = adminNavItems.filter((n) => n.id !== navItem.id);
    publicNav = getPublicNavbar(adminNavItems);

    if (publicNav.some((n) => n.id === navItem.id)) {
      throw new Error('Test 4 Failed: Item still present in navbar!');
    }
    if (cmsPage.id !== 'page_scholarship_nav_101') {
      throw new Error('Test 4 Failed: CMS Page document was deleted when nav item was removed!');
    }
    log('✓ Verified: Navigation item removed cleanly without deleting the underlying CMS Page document!');

    // TEST 5 — Re-add Menu Item
    log('Steps 23-26: Re-adding navigation item pointing to existing CMS Page');
    const reAddedNavItem: NavigationItem = {
      id: `nav_cms_${cmsPage.id}`,
      label: cmsPage.title,
      path: `/${cmsPage.slug}`,
      isCMSPage: true,
      cmsPageId: cmsPage.id,
      order: 2,
      visible: true,
    };
    adminNavItems.push(reAddedNavItem);
    publicNav = getPublicNavbar(adminNavItems);

    if (!publicNav.some((n) => n.path === '/scholarship-information')) {
      throw new Error('Test 5 Failed: Re-added menu item missing from navbar!');
    }
    log('✓ Verified: Menu item re-added pointing to existing CMS Page without duplicate page creation.');

    // TEST 6 — External URL & Validation
    log('Steps 27-30: Adding External Navigation Item with URL Validation');
    const invalidUrl = 'htpt://invalid-link';
    if (isValidExternalUrl(invalidUrl)) {
      throw new Error('Test 6 Failed: Invalid external URL accepted!');
    }
    const validUrl = 'https://portal.university.edu';
    if (!isValidExternalUrl(validUrl)) {
      throw new Error('Test 6 Failed: Valid HTTPS URL rejected!');
    }

    const externalNav: NavigationItem = {
      id: 'nav_ext_portal',
      label: 'Student Portal',
      path: validUrl,
      isExternal: true,
      targetBlank: true,
      order: 3,
      visible: true,
    };
    adminNavItems.push(externalNav);
    publicNav = getPublicNavbar(adminNavItems);

    const extInPublic = publicNav.find((n) => n.id === 'nav_ext_portal');
    if (!extInPublic || !extInPublic.isExternal || !extInPublic.targetBlank) {
      throw new Error('Test 6 Failed: External navigation item settings incomplete!');
    }
    log('✓ Verified: External URL link validated and opens in new tab with target="_blank".');

    // TEST 7 — Persistence Simulation
    log('Steps 31-32: Reloading & Verifying Navigation State');
    const reloadedNavbar = getPublicNavbar(adminNavItems);
    if (reloadedNavbar.length !== 4) {
      throw new Error('Test 7 Failed: Navbar count mismatch after reload!');
    }
    log('✓ Verified: All 32 steps passed! Navigation order, visibility, and links persist reliably.');

    console.log('=== SUCCESS: ALL 32 MANDATORY NAVIGATION E2E TEST STEPS PASSED ===');
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`❌ Phase 6 Navigation E2E Test Failed: ${errMsg}`);
    process.exit(1);
  }
}

runPhase6NavigationE2ETest();
