import { chromium } from 'playwright-core';

const chromePath = '/nix/store/yjbzyilg1yzylhyam1g3znxim97dwrhp-google-chrome-152.0.7977.64/share/google/chrome/chrome';

async function launchIphoneEmulator() {
  console.log('📱 Launching iPhone 15 Pro Emulator for http://localhost:3000 ...');
  
  const browser = await chromium.launch({
    headless: false,
    executablePath: chromePath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=450,960'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
  });

  const page = await context.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

  console.log('✅ iPhone Emulator is running! Press Ctrl+C in this terminal to exit when done.');

  // Keep process open
  await new Promise(() => {});
}

launchIphoneEmulator().catch(err => {
  console.error('Error starting iPhone emulator:', err);
});
