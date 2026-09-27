import { VitePWA } from 'vite-plugin-pwa';

export const pwa = () => VitePWA({
    registerType: 'prompt',
    includeAssets: ['favicon.png', 'icons/*.png'],
    manifest: {
        id: './', name: 'Snake', short_name: 'Snake',
        description: 'A classic snake game. Play with arrow keys, WASD, or touch, even offline.',
        start_url: './', scope: './', display: 'standalone',
        background_color: '#000000', theme_color: '#388e3c',
        categories: ['games'],
        icons: [
            { src: 'icons/snake-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: 'icons/snake-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: 'icons/snake-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
    },
    workbox: {
        globPatterns: ['**/*.{js,css,html,png,webmanifest}'],
        globIgnores: ['**/Screenshot*', '**/bg.png', '**/logo.png'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        // First installation controls this page; updates still wait for acceptance.
        clientsClaim: true
    }
});
