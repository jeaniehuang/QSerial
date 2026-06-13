const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push('CONSOLE: ' + msg.text()); });
  page.on('pageerror', err => errors.push('PAGEERROR: ' + err.message));
  await page.goto('file:///D:/QPrj/QSerial/website/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // Hero screenshot
  await page.screenshot({ path: 'full-hero.png' });

  // Scroll through and screenshot each section after triggering reveals
  const sections = ['comparison', 'capabilities', 'tools', 'scenarios', 'download'];
  for (const s of sections) {
    await page.evaluate((id) => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    }, s);
    await page.waitForTimeout(1800);
    await page.screenshot({ path: 'full-' + s + '.png' });
  }

  // Full page screenshot
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'full-complete.png', fullPage: true });

  // Check for reveal elements and their final state
  const revealInfo = await page.evaluate(() => {
    const els = document.querySelectorAll('[class*="reveal"]');
    const revealed = document.querySelectorAll('.revealed');
    return { total: els.length, revealed: revealed.length };
  });

  console.log('ERRORS: ' + JSON.stringify(errors));
  console.log('REVEAL: ' + JSON.stringify(revealInfo));
  await browser.close();
})();
