import { chromium } from '../node_modules/playwright-core/index.mjs';

const chromePath = '/nix/store/yjbzyilg1yzylhyam1g3znxim97dwrhp-google-chrome-152.0.7977.64/share/google/chrome/chrome';

async function launchIphoneEmulator() {
  console.log('📱 Launching Real iPhone 15 Pro Emulator Window on your desktop...');
  
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: false,
    args: [
      '--app=http://localhost:3000',
      '--window-size=430,920',
      '--window-position=200,80',
      '--touch-events=enabled',
      '--enable-touch-drag-drop',
      '--force-device-scale-factor=3',
      '--disable-infobars',
      '--no-default-browser-check'
    ]
  });

  const iPhoneProfile = {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1',
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true
  };

  const context = await browser.newContext(iPhoneProfile);
  const page = await context.newPage();

  console.log('📱 Navigating to http://localhost:3000 in iPhone emulator...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

  console.log('✅ iPhone 15 Pro Emulator is LIVE on your desktop screen!');
  console.log('   - Model: iPhone 15 Pro (iOS 17.4)');
  console.log('   - Viewport: 393 x 852 (Retina 3x)');
  console.log('   - Touch Mode: Touch Events & Gesture Tap Enabled');

  // Keep running for interactive use
  await new Promise(() => {});
}

launchIphoneEmulator().catch(err => {
  console.error('Emulator error:', err);
});
