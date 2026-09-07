const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/journal');
  await page.waitForLoadState('networkidle');
  const forms = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('form')).map(f => f.outerHTML);
  });
  console.log("Forms:", forms.length);
  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input[type="email"]')).map(el => {
      let current = el;
      while(current && current.tagName !== 'FORM') current = current.parentElement;
      return current ? current.outerHTML : el.outerHTML;
    });
  });
  console.log("Inputs:", inputs);
  await browser.close();
})();
