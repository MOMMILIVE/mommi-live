const { chromium } = require('playwright');

async function testCampaignAura() {
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

  console.log('\n======================================================');
  console.log('STARTING CAMPAIGNS AURA COPY DEEP VERIFICATION SUITE');
  console.log('======================================================\n');

  // 1. Verify all 10 /photographs/* Campaign Detail Pages
  const campaignProfiles = [
    {
      slug: 'rowan-sable',
      expectedTitle: 'PRADA',
      introSnippet: 'Private haute couture directive',
      practiceSnippet: 'Visual Capital Architecture',
      clientsSnippet: 'Prada SpA',
      honorsSnippet: 'Mandate 01 // Paris—Milan Protocol',
      forbiddenOldTexts: ['Rowan Sable is an editorial photographer', 'Vellum Review', 'Foam Talent Longlist']
    },
    {
      slug: 'inez-varden',
      expectedTitle: 'VOGUE SCANDINAVIA',
      introSnippet: 'Cover commission and visual identity directive',
      practiceSnippet: 'High Fashion Art Direction',
      clientsSnippet: 'Vogue Scandinavia',
      honorsSnippet: 'Editorial Directive // Cover Issue',
      forbiddenOldTexts: ['Inez Varden is a fashion photographer', 'Atelier Noé\nSora Paris', 'Vogue Photo Prize Finalist']
    },
    {
      slug: 'cassian-rook',
      expectedTitle: 'ORA × GQ',
      introSnippet: 'Spatial architecture and material study',
      practiceSnippet: 'Spatial Brutalism',
      clientsSnippet: 'ORA Capital Desk',
      honorsSnippet: 'Spatial Protocol // ORA Mandate',
      forbiddenOldTexts: ['Cassian Rook is a portrait photographer', 'Stedelijk Notes', 'LensCulture Portrait Awards Finalist']
    },
    {
      slug: 'livia-nohr',
      expectedTitle: 'HARLEY-DAVIDSON',
      introSnippet: 'Industrial machinery and heritage velocity directive',
      practiceSnippet: 'Industrial Kinetic Framing',
      clientsSnippet: 'Harley-Davidson Motor Co.',
      honorsSnippet: 'Velocity Protocol // HD Heritage',
      forbiddenOldTexts: ['Livia Nohr is a documentary photographer', 'Kinfolk Projects', 'World Press Photo Open Format']
    },
    {
      slug: 'milo-vey',
      expectedTitle: 'SONY MUSIC',
      introSnippet: 'Sonic visual direction and acoustic space construction',
      practiceSnippet: 'Acoustic Spatialization',
      clientsSnippet: 'Sony Music Entertainment',
      honorsSnippet: 'Sonic Mandate // Album Identity',
      forbiddenOldTexts: ['Milo Vey is a commercial photographer', 'Bellori Watches\nAster Motors', 'Red Dot Communication Design']
    },
    {
      slug: 'selene-arco',
      expectedTitle: 'SPOTIFY NORDIC',
      introSnippet: 'Cultural campaign architecture across Scandinavian stream networks',
      practiceSnippet: 'Algorithmic Image Systems',
      clientsSnippet: 'Spotify AB',
      honorsSnippet: 'Digital Ecosystem Protocol',
      forbiddenOldTexts: ['Selene Arco is a still life photographer', 'Colora Studio', 'D&AD New Blood Portfolio']
    },
    {
      slug: 'otto-vale',
      expectedTitle: 'HOLZWEILER',
      introSnippet: 'Runway scenography and seasonal visual direction',
      practiceSnippet: 'Tactile Material Science',
      clientsSnippet: 'Holzweiler Oslo',
      honorsSnippet: 'Runway Direction Protocol',
      forbiddenOldTexts: ['Otto Vale is a fine art photographer', 'Obscura Club\nVeil Records', 'Berlin Art Prize Longlist']
    },
    {
      slug: 'niko-lorne',
      expectedTitle: 'OSLO RUNWAY',
      introSnippet: 'Official Fashion Week visual curation and live extraction mandate',
      practiceSnippet: 'Spatial Choreography',
      clientsSnippet: 'Oslo Runway Federation',
      honorsSnippet: 'Official Fashion Week Mandate',
      forbiddenOldTexts: ['Niko Lorne is an architecture photographer', 'Porto Forma', 'ArchDaily Visual Story Award']
    },
    {
      slug: 'vera-callen',
      expectedTitle: 'PERSONACLO',
      introSnippet: 'Underground visual currency and drop architecture',
      practiceSnippet: 'Subversive Silhouette Framing',
      clientsSnippet: 'PersonaClo Syndicate',
      honorsSnippet: 'Underground Drop Protocol',
      forbiddenOldTexts: ['Vera Callen is a lifestyle photographer', 'Nord Table', 'Travel Photographer of the Year']
    },
    {
      slug: 'alma-riven',
      expectedTitle: 'REVENUE SYNDICATE',
      introSnippet: 'Private visual capital and sovereign aesthetic strategy',
      practiceSnippet: 'Private Visual Capital',
      clientsSnippet: 'Private Sovereign Desk',
      honorsSnippet: 'Sovereign Capital Mandate',
      forbiddenOldTexts: ['Alma Riven is a beauty photographer', 'Aure Skin\nMiro Beauty', 'International Photography Awards Beauty']
    }
  ];

  console.log('--- TEST 1: Direct Visits to all 10 /photographs/* Campaign Pages ---');
  for (const prof of campaignProfiles) {
    const url = `http://localhost:3000/photographs/${prof.slug}`;
    console.log(`Checking ${url} (${prof.expectedTitle})...`);
    await page.goto(url, { waitUntil: 'load' });
    try {
      await page.waitForFunction(
        intro => document.body && document.body.innerText.includes(intro),
        prof.introSnippet,
        { timeout: 8000 }
      );
    } catch (e) {}

    const pageText = await page.evaluate(() => document.body.innerText);

    // Verify presence of aura copy
    if (!pageText.includes(prof.introSnippet)) {
      throw new Error(`Missing expected aura intro on ${url}. Expected: "${prof.introSnippet}"`);
    }
    if (!pageText.includes(prof.practiceSnippet)) {
      throw new Error(`Missing expected aura practice on ${url}. Expected: "${prof.practiceSnippet}"`);
    }
    if (!pageText.includes(prof.clientsSnippet)) {
      throw new Error(`Missing expected aura client on ${url}. Expected: "${prof.clientsSnippet}"`);
    }
    if (!pageText.includes(prof.honorsSnippet)) {
      throw new Error(`Missing expected aura honors on ${url}. Expected: "${prof.honorsSnippet}"`);
    }

    // Verify absence of old placeholder copy
    for (const oldText of prof.forbiddenOldTexts) {
      if (pageText.includes(oldText)) {
        throw new Error(`Old placeholder text found on ${url}: "${oldText}"`);
      }
    }

    // Verify label transformation
    if (!pageText.includes('Mandate Dossier:') && !pageText.includes('Mandate Dossier')) {
      throw new Error(`Missing "Mandate Dossier:" label on ${url}`);
    }
    if (!pageText.includes('Syndicate Directives')) {
      throw new Error(`Missing "Syndicate Directives" label on ${url}`);
    }
    if (!pageText.includes('Commission Roster:') && !pageText.includes('Commission Roster')) {
      throw new Error(`Missing "Commission Roster:" label on ${url}`);
    }
    if (!pageText.includes('Institutional Citations:') && !pageText.includes('Institutional Citations')) {
      throw new Error(`Missing "Institutional Citations:" label on ${url}`);
    }

    console.log(`  ✓ ${prof.expectedTitle} aura copy verified 100%`);
  }

  // 1B. Verify Campaign Index Page (/photographs) Card Directive Tags
  console.log('\n--- TEST 1B: Campaign Index Page (/photographs) Card Directive Tags ---');
  await page.goto('http://localhost:3000/photographs', { waitUntil: 'load' });
  await page.waitForTimeout(600);
  const cardData = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href*="photographs/"]')).map(a => ({
      name: a.querySelector('[data-framer-name="Name"] p')?.textContent.trim(),
      tag: a.querySelector('[data-framer-name="Position"] p')?.textContent.trim()
    }));
  });
  const expectedTags = {
    'PRADA': 'Haute Couture Directives',
    'VOGUE SCANDINAVIA': 'Editorial Cover Systems',
    'ORA × GQ': 'Architectural Studies',
    'HARLEY-DAVIDSON': 'Heritage Velocity',
    'SONY MUSIC': 'Sonic Visual Systems',
    'SPOTIFY NORDIC': 'Cultural Intelligence',
    'HOLZWEILER': 'Runway Scenography',
    'OSLO RUNWAY': 'Fashion Week Official',
    'PERSONACLO': 'Contemporary Streetwear',
    'REVENUE SYNDICATE': 'Capital Aesthetics'
  };
  for (const [brand, expectedTag] of Object.entries(expectedTags)) {
    const card = cardData.find(c => c.name === brand);
    if (!card) throw new Error(`Missing campaign card for ${brand} on /photographs`);
    if (card.tag !== expectedTag) {
      throw new Error(`Incorrect tag on /photographs for ${brand}. Expected: "${expectedTag}", found: "${card.tag}"`);
    }
    console.log(`  ✓ ${brand} tag verified: "${expectedTag}"`);
  }

  // 2. Verify all 12 /photos/* Detail Pages
  const photoProjects = [
    { slug: 'salt-house', expectedTitle: 'Salt House', principal: 'OSLO RUNWAY', client: 'Oslo Runway Syndicate', location: 'Oslo — Comporta', creditsSnippet: 'Oslo Runway Directorate' },
    { slug: 'low-anthem', expectedTitle: 'Low Anthem', principal: 'ORA × GQ', client: 'ORA Capital Desk', location: 'Oslo — Zurich', creditsSnippet: 'Volumetric Light' },
    { slug: 'glass-orchard', expectedTitle: 'Glass Orchard', principal: 'PRADA', client: 'Prada SpA', location: 'Milan — Paris', creditsSnippet: 'Haute Couture Direction' },
    { slug: 'pale-ceremony', expectedTitle: 'Pale Ceremony', principal: 'VOGUE SCANDINAVIA', client: 'Vogue Scandinavia', location: 'Stockholm — Paris', creditsSnippet: 'Cover Curation' },
    { slug: 'pigment-index', expectedTitle: 'Pigment Index', principal: 'SPOTIFY NORDIC', client: 'Spotify Nordic Group', location: 'Stockholm — Oslo', creditsSnippet: 'Stream Architecture' },
    { slug: 'mirror-pollen', expectedTitle: 'Mirror Pollen', principal: 'REVENUE SYNDICATE', client: 'Revenue Syndicate', location: 'Geneva — London', creditsSnippet: 'Visual Capital' },
    { slug: 'black-alloy', expectedTitle: 'Black Alloy', principal: 'SONY MUSIC', client: 'Sony Music Entertainment', location: 'London — Berlin', creditsSnippet: 'Sonic Visual Direction' },
    { slug: 'map-of-heat', expectedTitle: 'Map of Heat', principal: 'IMMERSIVE PROTOCOL', client: 'Immersive Protocol', location: 'Tbilisi — Europe', creditsSnippet: 'Tbilisi Cell' },
    { slug: 'rooms-for-rain', expectedTitle: 'Rooms for Rain', principal: 'PERSONACLO', client: 'PersonaClo Labs', location: 'Amsterdam — Tokyo', creditsSnippet: 'Streetwear Direction' },
    { slug: 'night-conservatory', expectedTitle: 'Night Conservatory', principal: 'HOLZWEILER', client: 'Holzweiler Bureau', location: 'Copenhagen — Oslo', creditsSnippet: 'Runway Direction' },
    { slug: 'handmade-weather', expectedTitle: 'Handmade Weather', principal: 'HARLEY-DAVIDSON', client: 'Harley-Davidson Heritage', location: 'Berlin — Milwaukee', creditsSnippet: 'Velocity Framing' },
    { slug: 'surface-room', expectedTitle: 'Surface Room', principal: 'REVENUE SYNDICATE', client: 'Sovereign Capital Guild', location: 'Geneva — London', creditsSnippet: 'Sovereign Desk' }
  ];

  console.log('\n--- TEST 2: Direct Visits to all 12 /photos/* Projects (Grid View) ---');
  for (const proj of photoProjects) {
    const url = `http://localhost:3000/photos/${proj.slug}`;
    console.log(`Checking ${url} (${proj.expectedTitle})...`);
    await page.goto(url, { waitUntil: 'load' });
    try {
      await page.waitForFunction(
        client => document.body && document.body.innerText.includes(client),
        proj.client,
        { timeout: 8000 }
      );
    } catch (e) {}

    const pageText = await page.evaluate(() => document.body.innerText);

    if (!pageText.includes(proj.client)) {
      throw new Error(`Missing expected client "${proj.client}" on ${url}`);
    }
    if (!pageText.includes(proj.principal)) {
      throw new Error(`Missing expected principal "${proj.principal}" on ${url}`);
    }
    if (!pageText.includes(proj.location)) {
      throw new Error(`Missing expected location "${proj.location}" on ${url}`);
    }
    if (!pageText.includes(proj.creditsSnippet)) {
      throw new Error(`Missing expected credits snippet "${proj.creditsSnippet}" on ${url}`);
    }

    // Verify old credits are gone
    const oldCreditNames = ['Camille Laurent', 'Camille Duarte', 'Antoine Leroy', 'Theo Lambert', 'Léa Moreau', 'Clara Dubois'];
    for (const oldName of oldCreditNames) {
      if (pageText.includes(oldName)) {
        throw new Error(`Old credit "${oldName}" found on ${url}`);
      }
    }

    // Verify labels
    if (!pageText.includes('Protocol Credits') && !pageText.includes('Credits')) {
      throw new Error(`Missing credits section on ${url}`);
    }

    console.log(`  ✓ ${proj.expectedTitle} client "${proj.client}", location "${proj.location}" & credits verified`);
  }

  console.log('\n--- TEST 2B: Direct Visits to all 12 /photos/*/list Projects (List View) ---');
  for (const proj of photoProjects) {
    const url = `http://localhost:3000/photos/${proj.slug}/list`;
    console.log(`Checking ${url} (${proj.expectedTitle} List View)...`);
    await page.goto(url, { waitUntil: 'load' });
    try {
      await page.waitForFunction(
        client => document.body && document.body.innerText.includes(client),
        proj.client,
        { timeout: 8000 }
      );
    } catch (e) {}

    const pageText = await page.evaluate(() => document.body.innerText);

    if (!pageText.includes(proj.client)) {
      throw new Error(`Missing expected client "${proj.client}" on ${url}`);
    }
    if (!pageText.includes(proj.principal)) {
      throw new Error(`Missing expected principal "${proj.principal}" on ${url}`);
    }
    if (!pageText.includes(proj.location)) {
      throw new Error(`Missing expected location "${proj.location}" on ${url}`);
    }
    if (!pageText.includes(proj.creditsSnippet)) {
      throw new Error(`Missing expected credits snippet "${proj.creditsSnippet}" on ${url}`);
    }

    // Verify template location is NOT present
    const forbiddenLocations = ['Comporta, Portugal', 'London, UK', 'Amsterdam, Netherlands', 'Paris, France', 'Barcelona, Spain', 'New York, USA', 'Milan, Italy', 'Mexico City, Mexico', 'Stockholm, Sweden', 'Berlin, Germany', 'Copenhagen, Denmark'];
    for (const fl of forbiddenLocations) {
      if (pageText.includes(fl)) {
        throw new Error(`Old template location "${fl}" found on ${url}`);
      }
    }

    console.log(`  ✓ ${proj.expectedTitle} list view: location "${proj.location}", client "${proj.client}" verified`);
  }

  console.log('\n--- TEST 3: Category Campaign Pages & List Views ---');
  const catPages = [
    'http://localhost:3000/categories/campaign',
    'http://localhost:3000/categories/campaign/list',
    'http://localhost:3000/photos/list'
  ];
  for (const catUrl of catPages) {
    await page.goto(catUrl, { waitUntil: 'load' });
    await page.waitForTimeout(600);
    const text = await page.evaluate(() => document.body.innerText);

    // Old clients should NOT exist
    const forbiddenClients = ['Terra House', 'Echo Records', 'Aster Magazine', 'Aure Skin', 'Obscura Club', 'Hearth Journal'];
    for (const fc of forbiddenClients) {
      if (text.includes(fc)) {
        throw new Error(`Old client "${fc}" found on ${catUrl}`);
      }
    }

    // New syndicate clients should exist
    if (!text.includes('Oslo Runway Syndicate')) throw new Error(`Missing Oslo Runway Syndicate on ${catUrl}`);
    if (!text.includes('ORA Capital Desk')) throw new Error(`Missing ORA Capital Desk on ${catUrl}`);
    if (!text.includes('Prada SpA')) throw new Error(`Missing Prada SpA on ${catUrl}`);

    console.log(`  ✓ ${catUrl} displays clean syndicate clients without old copy`);
  }

  console.log('\n--- TEST 3B: Journal Aura Treatises & About Page Contact Sanitization ---');
  await page.goto('http://localhost:3000/journal', { waitUntil: 'load' });
  await page.waitForTimeout(600);
  const journalText = await page.evaluate(() => document.body.innerText);
  const expectedJournalTitles = [
    'The Architecture of Visual Capital: Beyond Advertising and Image Systems',
    'Sonic Space Construction: Acoustic Spatialization and Suppressed Illumination',
    'Spatial Brutalism: Volumetric Light and Private Asset Framing',
    'Haute Couture Mandate: Architectural Silhouette Framing',
    'The Georgia Protocol: 4-Day Private Extractions and Brand Reconstruction in Tbilisi',
    'Monochromatic Restraint: Visual Capital and Surface Subtraction'
  ];
  for (const jt of expectedJournalTitles) {
    if (!journalText.includes(jt)) {
      throw new Error(`Missing journal aura treatise: "${jt}" on /journal`);
    }
  }
  console.log('  ✓ All 6 journal aura treatises verified on /journal');

  await page.goto('http://localhost:3000/about', { waitUntil: 'load' });
  await page.waitForTimeout(600);
  const aboutText = await page.evaluate(() => document.body.innerText);
  if (aboutText.includes('+40 22 312 14 60')) {
    throw new Error('Unsanitized Romanian phone number "+40 22 312 14 60" found on /about');
  }
  if (!aboutText.includes('Encrypted Dispatch // Mandate Only')) {
    throw new Error('Missing sanitized phone text "Encrypted Dispatch // Mandate Only" on /about');
  }
  console.log('  ✓ About contact sanitization verified');

  console.log('\n--- TEST 4: Client-Side Navigation & Hydration Integrity ---');
  await page.goto('http://localhost:3000/photographs', { waitUntil: 'load' });
  await page.waitForTimeout(600);

  // Click PRADA
  console.log('Navigating /photographs -> PRADA (/photographs/rowan-sable)...');
  await page.click('text=PRADA');
  await page.waitForTimeout(800);
  let pageText = await page.evaluate(() => document.body.innerText);
  if (!pageText.includes('Private haute couture directive')) {
    throw new Error('Aura intro missing after client-side transition to PRADA');
  }
  if (!pageText.includes('Prada SpA')) {
    throw new Error('Prada SpA missing after client-side transition to PRADA');
  }

  // Click Back
  console.log('Navigating back to /photographs...');
  await page.click('text=Back to photographs');
  await page.waitForTimeout(800);

  // Click VOGUE SCANDINAVIA
  console.log('Navigating /photographs -> VOGUE SCANDINAVIA (/photographs/inez-varden)...');
  await page.click('text=VOGUE SCANDINAVIA');
  await page.waitForTimeout(800);
  pageText = await page.evaluate(() => document.body.innerText);
  if (!pageText.includes('Cover commission and visual identity directive')) {
    throw new Error('Aura intro missing after client-side transition to VOGUE SCANDINAVIA');
  }
  if (!pageText.includes('Vogue Scandinavia')) {
    throw new Error('Vogue Scandinavia missing after client-side transition');
  }

  // Navigate to /photos and click a project
  console.log('Navigating to /photos...');
  await page.goto('http://localhost:3000/photos', { waitUntil: 'load' });
  await page.waitForTimeout(600);

  console.log('Clicking Salt House card...');
  await page.click('text=Salt House');
  await page.waitForTimeout(800);
  pageText = await page.evaluate(() => document.body.innerText);
  if (!pageText.includes('Oslo Runway Syndicate')) {
    throw new Error('Syndicate client missing after client-side navigation to Salt House');
  }
  if (pageText.includes('Terra House')) {
    throw new Error('Old client Terra House visible after transition');
  }

  console.log('✓ Client-side transitions preserve 100% aura copy and React stability');

  console.log('\n--- TEST 5: Console & Runtime Errors ---');
  console.log('Total console errors caught:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.error('Console errors:', consoleErrors);
    throw new Error(`Fatal console errors encountered: ${consoleErrors.length}`);
  }
  console.log('✓ Zero console/runtime errors detected across all tested flows');

  await browser.close();
  console.log('\n======================================================');
  console.log('ALL CAMPAIGN AURA VERIFICATIONS PASSED WITH 100% SUCCESS');
  console.log('======================================================\n');
}

testCampaignAura().catch(err => {
  console.error('\n❌ VERIFICATION SUITE FAILED:', err);
  process.exit(1);
});
