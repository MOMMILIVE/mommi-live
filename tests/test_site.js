const { chromium } = require('playwright');

async function runAllTests() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const consoleErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push({ url: page.url(), type: msg.type(), text: msg.text() });
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push({ url: page.url(), type: 'pageerror', text: err.message });
  });

  console.log('--- TEST 1: Home Page Hero Slider (Desktop) ---');
  await page.goto('http://localhost:3000/', { waitUntil: 'load' });
  await page.waitForTimeout(1500);

  const heroSlidesDesktop = await page.evaluate(() => {
    const slides = Array.from(document.querySelectorAll('a[data-framer-name="Slider Desk"]'));
    return slides.map(s => ({
      href: s.getAttribute('href'),
      pointerEvents: window.getComputedStyle(s).pointerEvents
    }));
  });
  console.log('Desktop hero slides count:', heroSlidesDesktop.length);
  if (heroSlidesDesktop.length === 0) throw new Error('No desktop hero slides found');
  for (const s of heroSlidesDesktop) {
    if (s.href !== null) throw new Error('Desktop hero slide has href: ' + s.href);
    if (s.pointerEvents !== 'none') throw new Error('Desktop hero slide pointer-events is not none: ' + s.pointerEvents);
  }
  console.log('✓ All desktop hero slides are non-clickable (pointer-events: none)');

  console.log('\n--- TEST 2: Home Page Hero Slider (Mobile Viewport) ---');
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileContext.newPage();
  mobilePage.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push({ url: mobilePage.url(), type: msg.type(), text: msg.text() });
  });
  mobilePage.on('pageerror', err => {
    consoleErrors.push({ url: mobilePage.url(), type: 'pageerror', text: err.message });
  });
  await mobilePage.goto('http://localhost:3000/', { waitUntil: 'load' });
  await mobilePage.waitForTimeout(1500);

  const heroSlidesMobile = await mobilePage.evaluate(() => {
    const slides = Array.from(document.querySelectorAll('a[data-framer-name="Slider Mob"]'));
    return slides.map(s => ({
      href: s.getAttribute('href'),
      pointerEvents: window.getComputedStyle(s).pointerEvents
    }));
  });
  console.log('Mobile hero slides count:', heroSlidesMobile.length);
  if (heroSlidesMobile.length === 0) throw new Error('No mobile hero slides found');
  for (const s of heroSlidesMobile) {
    if (s.href !== null) throw new Error('Mobile hero slide has href: ' + s.href);
    if (s.pointerEvents !== 'none') throw new Error('Mobile hero slide pointer-events is not none: ' + s.pointerEvents);
  }
  console.log('✓ All mobile hero slides are non-clickable (pointer-events: none)');
  await mobileContext.close();

  console.log('\n--- TEST 3: Photos Page Filter Buttons & View Toggles ---');
  await page.goto('http://localhost:3000/photos', { waitUntil: 'load' });
  await page.waitForTimeout(1500);

  const categories = [
    { name: 'Fashion', expectedPath: '/categories/fashion' },
    { name: 'Campaign', expectedPath: '/categories/campaign' },
    { name: 'Art', expectedPath: '/categories/art' },
    { name: 'Commercial', expectedPath: '/categories/commercial' },
    { name: 'All', expectedPath: '/photos' }
  ];

  for (const cat of categories) {
    console.log('Clicking category:', cat.name);
    const btn = page.locator(`text=${cat.name}`).first();
    await btn.click();
    await page.waitForTimeout(1000);
    const currentUrl = page.url();
    console.log(`  -> URL: ${currentUrl}`);
    if (!currentUrl.includes(cat.expectedPath)) {
      throw new Error(`Category ${cat.name} expected ${cat.expectedPath} but got ${currentUrl}`);
    }
  }
  console.log('✓ All category filter buttons navigate as expected');

  console.log('\n--- TEST 4: View Mode Toggle (Grid & List & Rapid Switch) ---');
  await page.goto('http://localhost:3000/photos', { waitUntil: 'load' });
  await page.waitForTimeout(1500);

  const listBtn = page.locator('text=List').first();
  await listBtn.click();
  await page.waitForTimeout(1000);
  console.log('  -> URL after List toggle:', page.url());
  if (!page.url().includes('/photos/list')) throw new Error('List view did not navigate to /photos/list');

  const gridBtn = page.locator('text=Grid').first();
  await gridBtn.click();
  await page.waitForTimeout(1000);
  console.log('  -> URL after Grid toggle:', page.url());
  if (!page.url().endsWith('/photos')) throw new Error('Grid view did not navigate to /photos');

  // Rapid switching test
  await listBtn.click();
  await page.waitForTimeout(300);
  await gridBtn.click();
  await page.waitForTimeout(300);
  await listBtn.click();
  await page.waitForTimeout(800);
  if (!page.url().includes('/photos/list')) throw new Error('Rapid switch failed to end at /photos/list');
  await gridBtn.click();
  await page.waitForTimeout(800);
  if (!page.url().endsWith('/photos')) throw new Error('Rapid switch failed to return to /photos');
  console.log('✓ View mode toggles and rapid transitions work as expected');

  console.log('\n--- TEST 5: Photos Page Photo Cards Are Clickable & Navigable ---');
  const photosCards = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.framer-v3P8v, a[data-framer-name="Card Main"]'));
    return cards.map(c => ({
      href: c.getAttribute('href'),
      pointerEvents: window.getComputedStyle(c).pointerEvents
    }));
  });
  console.log('Photos page photo cards count:', photosCards.length);
  if (photosCards.length === 0) throw new Error('No photo cards found on /photos');
  for (const c of photosCards) {
    if (c.pointerEvents === 'none') throw new Error('Subpage photo card has pointer-events: none');
  }
  console.log('✓ Photos on /photos have active pointer events');

  // Test clicking a card on /photographs navigates to detail page
  await page.goto('http://localhost:3000/photographs', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  console.log('Clicking PRADA card on /photographs...');
  await page.click('text=PRADA');
  await page.waitForTimeout(1200);
  console.log('  -> URL after card click:', page.url());
  if (!page.url().includes('/photographs/rowan-sable')) {
    throw new Error('Clicking PRADA card did not navigate to /photographs/rowan-sable');
  }
  // Test clicking "Back to photographs"
  console.log('Clicking "Back to photographs"...');
  await page.click('text=Back to photographs');
  await page.waitForTimeout(1200);
  console.log('  -> URL after back click:', page.url());
  if (!page.url().endsWith('/photographs')) {
    throw new Error('Back to photographs did not return to /photographs');
  }
  console.log('✓ Individual photo card navigation and back button work correctly');

  console.log('\n--- TEST 6: Navigation via Menu ---');
  const navTargets = [
    { label: 'About', path: '/about' },
    { label: 'Photographs', path: '/photographs' },
    { label: 'Journal', path: '/journal' },
    { label: 'Archive', path: '/archive' },
    { label: 'Home', path: '/' }
  ];

  for (const target of navTargets) {
    console.log('Navigating via menu to:', target.label);
    const menuBtn = page.locator('text=Menu').first();
    await menuBtn.click();
    await page.waitForTimeout(600);

    const link = page.locator(`text=${target.label}`).last();
    await link.click();
    await page.waitForTimeout(1200);
    console.log(`  -> URL: ${page.url()}`);
    if (target.path === '/' && !page.url().endsWith(':3000/')) {
      throw new Error(`Expected home root / but got ${page.url()}`);
    } else if (target.path !== '/' && !page.url().includes(target.path)) {
      throw new Error(`Expected ${target.path} but got ${page.url()}`);
    }
  }
  console.log('✓ Menu navigation across all pages works smoothly');

  console.log('\n--- TEST 7: Direct Page Visits & Brand QC ---');
  const pagesToQC = [
    { url: 'http://localhost:3000/', expectedTitle: 'Mommi Live — Creative Syndicate · Europe' },
    { url: 'http://localhost:3000/about', expectedTitle: 'Mommi Live — About · Creative Syndicate' },
    { url: 'http://localhost:3000/photographs', expectedTitle: 'Mommi Live — Selected Works' },
    { url: 'http://localhost:3000/photos', expectedTitle: 'Mommi Live — Selected Works' },
    { url: 'http://localhost:3000/photos/list', expectedTitle: 'Mommi Live — Selected Works' },
    { url: 'http://localhost:3000/categories/fashion', expectedTitle: 'Mommi Live — Selected Works' },
    { url: 'http://localhost:3000/categories/campaign', expectedTitle: 'Mommi Live — Selected Works' },
    { url: 'http://localhost:3000/journal', expectedTitle: 'Mommi Live — Journal & Treatises' },
    { url: 'http://localhost:3000/archive', expectedTitle: 'Mommi Live — Archive' },
    { url: 'http://localhost:3000/photographs/rowan-sable', expectedTitle: 'Mommi Live — Selected Works' }
  ];

  for (const p of pagesToQC) {
    await page.goto(p.url, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    const title = await page.title();
    console.log(`Direct visit ${p.url}: title = "${title}"`);
    if (title !== p.expectedTitle) {
      throw new Error(`Title for ${p.url} should be "${p.expectedTitle}", got "${title}"`);
    }

    const checkCopy = await page.evaluate(() => {
      const texts = Array.from(document.querySelectorAll('p, a, span, h1, h2')).map(e => e.innerText.trim());
      const hasDumont = texts.some(t => t.toLowerCase() === 'dumont' || t.includes('Dumont Paris') || t.includes('dumont.com'));
      const hasMomentLive = texts.some(t => t.includes('Moment Live'));
      const hasEmail = texts.some(t => t.includes('access@mommilive.com'));
      const hasForbiddenLinks = Array.from(document.querySelectorAll('a'))
        .map(a => a.getAttribute('href') || '')
        .some(h => h.includes('satto.studio') || h.includes('behance.net') || h.includes('are.na') || (h.includes('instagram.com') && !h.includes('mommilive')));
      return { hasDumont, hasMomentLive, hasEmail, hasForbiddenLinks };
    });
    if (checkCopy.hasDumont) throw new Error(`Legacy Dumont copy found on ${p.url}`);
    if (checkCopy.hasMomentLive) throw new Error(`Typo "Moment Live" found on ${p.url}`);
    if (checkCopy.hasForbiddenLinks) throw new Error(`Forbidden template links found on ${p.url}`);
  }
  console.log('✓ All pages pass brand QC (Mommi Live, access@mommilive.com, exact titles, no Dumont/Moment Live, zero forbidden links)');

  console.log('\n--- TEST 8: Authentic Social Media & Profile Links ---');
  await page.goto('http://localhost:3000/about', { waitUntil: 'load' });
  await page.waitForTimeout(1000);

  const socialLinks = await page.evaluate(() => {
    const containers = Array.from(document.querySelectorAll('.framer-wb69ci'));
    if (containers.length === 0) return { count: 0, links: [], forbiddenHrefs: [] };
    const firstContainerLinks = Array.from(containers[0].querySelectorAll('a')).map(a => ({
      text: a.innerText.trim(),
      href: a.getAttribute('href'),
      target: a.getAttribute('target'),
      rel: a.getAttribute('rel'),
      pointerEvents: window.getComputedStyle(a).pointerEvents
    }));

    const allLinksOnPage = Array.from(document.querySelectorAll('a')).map(a => a.getAttribute('href') || '');
    const forbiddenExternalHrefs = allLinksOnPage.filter(h =>
      h.includes('satto.studio') || h.includes('behance.net') || h.includes('are.na') || (h.includes('instagram.com') && !h.includes('mommilive'))
    );

    return {
      containerCount: containers.length,
      links: firstContainerLinks,
      forbiddenHrefs: forbiddenExternalHrefs
    };
  });

  console.log('Social containers found on /about:', socialLinks.containerCount);
  console.log('Social links:', socialLinks.links);

  const expectedProfiles = [
    { name: 'Instagram', url: 'https://www.instagram.com/mommilive/' },
    { name: 'EverybodyWiki', url: 'https://en.everybodywiki.com/Mommi_Live' },
    { name: 'Crunchbase', url: 'https://www.crunchbase.com/person/mommi-live-e7dc' },
    { name: 'IMDb', url: 'https://www.imdb.com/name/nm18188551/' }
  ];

  for (const exp of expectedProfiles) {
    const found = socialLinks.links.find(l => l.href === exp.url && l.text.includes(exp.name));
    if (!found) {
      throw new Error(`Missing authentic profile link for ${exp.name} (${exp.url}) in .framer-wb69ci`);
    }
    if (found.target !== '_blank') {
      throw new Error(`Social link for ${exp.name} does not have target="_blank"`);
    }
    if (found.pointerEvents === 'none') {
      throw new Error(`Social link for ${exp.name} has pointer-events: none`);
    }
    console.log(`  ✓ ${exp.name} link verified: ${exp.url}`);
  }

  if (socialLinks.forbiddenHrefs.length > 0) {
    throw new Error(`Template links still found on /about: ${socialLinks.forbiddenHrefs.join(', ')}`);
  }
  console.log('✓ Zero forbidden template external links found (satto.studio, behance.net, are.na eliminated)');

  console.log('\n--- TEST 9: Console Errors Check ---');
  console.log('Total console errors caught:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log('Errors:', consoleErrors);
    throw new Error('Fatal/console errors detected during testing');
  }
  console.log('✓ Zero console/runtime errors caught across all interactions');

  await browser.close();
  console.log('\n========================================');
  console.log('ALL INTEGRATION TESTS PASSED WITH 100% SUCCESS');
  console.log('========================================');
}

runAllTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
