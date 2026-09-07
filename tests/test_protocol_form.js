const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  let mailtoTriggered = false;
  page.on('framenavigated', frame => {
    if (frame.url().startsWith('mailto:')) {
      mailtoTriggered = frame.url();
    }
  });
  // Playwright intercepts navigation to mailto
  page.route('mailto:**', route => {
    mailtoTriggered = route.request().url();
    route.abort(); // don't actually open mail client
  });

  await page.goto('http://localhost:3000/journal');
  await page.waitForLoadState('networkidle');

  // Fill in the form and submit
  await page.fill('input[type="email"]', 'test@example.com');
  await page.click('button[type="submit"]');

  await page.waitForTimeout(500);

  if (mailtoTriggered) {
    console.log("SUCCESS: mailto triggered:", mailtoTriggered);
    process.exit(0);
  } else {
    console.log("FAIL: Form submitted but mailto not triggered");
    process.exit(1);
  }
})();
