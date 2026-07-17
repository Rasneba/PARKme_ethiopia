import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aksum.parkme',
  appName: 'Parkme Ethiopia',
  webDir: 'out',
  server: {
    url: 'https://parkmeethiopia.vercel.app',
    cleartext: true,
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#0fa24b',
  },
};

export default config;
