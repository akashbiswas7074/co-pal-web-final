import { chromium } from 'playwright-core';

const chromePath = '/nix/store/yjbzyilg1yzylhyam1g3znxim97dwrhp-google-chrome-152.0.7977.64/share/google/chrome/chrome';

async function launchAndroidEmulator() {
  console.log('🤖 Launching Android Pixel 7 Emulator for http://localhost:3000 ...');
  
  const browser = await chromium.launch({
    headless: false,
    executablePath: chromePath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=470,1020'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
  });

  const page = await context.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

  console.log('✅ Android Emulator is running! Press Ctrl+C in this terminal to exit when done.');

  // Keep process open
  await new Promise(() => {});
}

launchAndroidEmulator().catch(err => {
  console.error('Error starting Android emulator:', err);
});
