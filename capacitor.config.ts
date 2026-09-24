import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.peeds.app',
  appName: 'Peeds',
  webDir: 'public',
  server: {
    url: process.env.CAPACITOR_SERVER_URL || 'https://www.peeds.in',
    androidScheme: 'https',
    cleartext: true,
  },
  ios: {
    contentInset: 'always',
    scrollEnabled: true,
    preferredContentMode: 'mobile',
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  }
};

export default config;
