import { VitePWA } from 'vite-plugin-pwa';

export const pwaPlugin = VitePWA({
  registerType: 'autoUpdate',
  manifest: '/public/manifest.webmanifest',
  includeAssets: ['public/icon-192.png', 'public/icon-512.png'],
  workbox: {
    globPatterns: ['**/*.{js,css,html,png,svg,webmanifest}'],
  },
});
