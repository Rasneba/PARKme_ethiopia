import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aksum.parkme',
  appName: 'prakme-ethiopia',
  webDir: 'out',
  server: {
    url: 'https://prakme-ethiopia.vercel.app',
    cleartext: false
  }
};

export default config;
