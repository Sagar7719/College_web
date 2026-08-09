import { runDynamicPageNavigationE2ETest } from '../src/lib/test-dynamic-page';

async function executeTest() {
  console.log('--- STARTING PHASE 3 MANDATORY DYNAMIC NAVIGATION E2E TEST ---');
  const result = await runDynamicPageNavigationE2ETest();
  console.log('--- TEST RESULTS LOGS ---');
  result.logs.forEach((l) => console.log(l));
  if (result.success) {
    console.log('=== SUCCESS: ALL 18 MANDATORY END-TO-END TEST STEPS PASSED ===');
    process.exit(0);
  } else {
    console.error('=== FAILURE: MANDATORY E2E TEST FAILED ===');
    process.exit(1);
  }
}

executeTest();
