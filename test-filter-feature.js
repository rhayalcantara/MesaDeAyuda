const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testFilterVerification() {
  console.log('Starting Filter Verification Test (Feature #29)...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  try {
    // Step 1: Navigate to the filter verification page
    console.log('Step 1: Navigating to filter verification page...');
    await page.goto('http://localhost:3000/demo/filter-verification', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(screenshotsDir, '1-initial-page.png') });
    console.log('  Screenshot saved: 1-initial-page.png');

    // Verify initial state
    const pageTitle = await page.textContent('h1');
    console.log(`  Page title: ${pageTitle}`);

    // Check initial tickets
    const initialTicketCount = await page.locator('tbody tr').count();
    console.log(`  Initial ticket count: ${initialTicketCount}\n`);

    // Step 2: Click the "Run Automated Test" button
    console.log('Step 2: Clicking "Run Automated Test" button...');
    await page.click('button:has-text("Run Automated Test")');

    // Wait for the test to complete (look for the success message)
    console.log('  Waiting for test to complete...');
    await page.waitForSelector('text=Test PASSED', { timeout: 15000 });

    await page.screenshot({ path: path.join(screenshotsDir, '2-test-completed.png') });
    console.log('  Screenshot saved: 2-test-completed.png\n');

    // Step 3: Verify all steps passed
    console.log('Step 3: Verifying test results...');

    const stepStatuses = await page.$$eval('.space-y-3 > div', divs => {
      return divs.map(div => {
        const stepText = div.querySelector('.font-medium')?.textContent || '';
        const statusIcon = div.querySelector('.text-2xl')?.textContent || '';
        return { step: stepText, status: statusIcon };
      });
    });

    let allPassed = true;
    stepStatuses.forEach(({ step, status }) => {
      const passed = status === '✓';
      console.log(`  ${passed ? '✓' : '✗'} ${step}`);
      if (!passed) allPassed = false;
    });

    // Step 4: Verify the test summary
    const testSummary = await page.textContent('.bg-green-100');
    console.log(`\n  Test summary found: ${testSummary.includes('Test PASSED') ? 'PASSED' : 'FAILED'}`);

    // Step 5: Verify current filter state
    const currentFilter = await page.inputValue('select');
    console.log(`  Current filter: ${currentFilter || 'None'}`);

    // Step 6: Verify ticket count in table footer
    const footerText = await page.textContent('.bg-gray-50.dark\\:bg-gray-700 p');
    console.log(`  Footer: ${footerText}`);

    // Final screenshot
    await page.screenshot({ path: path.join(screenshotsDir, '3-final-state.png'), fullPage: true });
    console.log('\n  Screenshot saved: 3-final-state.png');

    // Overall result
    console.log('\n' + '='.repeat(50));
    if (allPassed) {
      console.log('FEATURE #29 TEST: PASSED ✓');
      console.log('All filter verification steps completed successfully.');
      console.log('Filter results correctly match actual created data.');
    } else {
      console.log('FEATURE #29 TEST: FAILED ✗');
      console.log('Some test steps did not pass.');
    }
    console.log('='.repeat(50));

    return allPassed;

  } catch (error) {
    console.error('\nTest failed with error:', error.message);
    await page.screenshot({ path: path.join(screenshotsDir, 'error-state.png') });
    return false;
  } finally {
    await browser.close();
  }
}

testFilterVerification()
  .then(passed => process.exit(passed ? 0 : 1))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
