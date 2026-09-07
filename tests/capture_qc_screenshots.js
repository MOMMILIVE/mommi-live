const { chromium } = require('playwright');
const fs = require('fs');

if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

async function captureScreenshots() {
  const browser = await chromium.launch();

  // 1. Desktop (1440px) Campaign Detail page
  const deskContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const deskPage = await deskContext.newPage();
  await deskPage.goto('http://localhost:3000/photographs/rowan-sable', { waitUntil: 'networkidle' });
  await deskPage.waitForTimeout(1000);
  await deskPage.screenshot({ path: 'screenshots/desktop_campaign_detail.png', fullPage: false });
  console.log('Captured desktop_campaign_detail.png');

  // 2. Mobile (390px) /photos page (Directives heading)
  const mobContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobPage = await mobContext.newPage();
  await mobPage.goto('http://localhost:3000/photos', { waitUntil: 'networkidle' });
  await mobPage.waitForTimeout(1000);
  await mobPage.screenshot({ path: 'screenshots/mobile_photos_directives.png' });
  console.log('Captured mobile_photos_directives.png');

  // 3. Mobile (390px) /journal page (Newsletter label)
  await mobPage.goto('http://localhost:3000/journal', { waitUntil: 'networkidle' });
  await mobPage.waitForTimeout(1000);
  await mobPage.screenshot({ path: 'screenshots/mobile_journal_newsletter.png' });
  console.log('Captured mobile_journal_newsletter.png');

  // 4. Mobile (390px) /about page (Press links)
  await mobPage.goto('http://localhost:3000/about', { waitUntil: 'networkidle' });
  await mobPage.waitForTimeout(1000);
  const pressEl = await mobPage.locator('[data-framer-name="Press"]').first();
  await pressEl.scrollIntoViewIfNeeded();
  await mobPage.waitForTimeout(600);
  await mobPage.screenshot({ path: 'screenshots/mobile_about_press.png' });
  console.log('Captured mobile_about_press.png');

  // 5. Desktop (1440px) pagination link at bottom
  await deskPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await deskPage.waitForTimeout(600);
  await deskPage.screenshot({ path: 'screenshots/desktop_campaign_pagination.png' });
  console.log('Captured desktop_campaign_pagination.png');

  await browser.close();
}

captureScreenshots().catch(err => {
  console.error(err);
  process.exit(1);
});
