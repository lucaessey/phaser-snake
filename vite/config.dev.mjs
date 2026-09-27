import { defineConfig } from 'vite';
import { pwa } from './pwa.mjs';

export default defineConfig({
    base: './',
    plugins: [pwa()],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        },
    },
    server: {
        port: 8080
    }
});
