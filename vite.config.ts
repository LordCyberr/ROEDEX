/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    crx({ manifest }),
  ],
  build: {
    sourcemap: false, // Never ship source maps in the packaged extension
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
        manualChunks: {
          // Vendor splits
          vendor_motion: ['motion/react'],
          vendor_lucide: ['lucide-react'],
          vendor_state:  ['zustand'],
          vendor_db:     ['dexie', 'dexie-react-hooks'],
          vendor_zod:    ['zod'],
          // Recharts + D3 deps extracted to keep debug-panel.js under 500KB
          vendor_charts: ['recharts', 'd3-shape', 'd3-scale', 'd3-array', 'd3-interpolate', 'd3-color', 'd3-format', 'd3-time', 'd3-time-format'],
          // App splits — heavy views isolated from the main bundle
          'views-heavy': [
            './src/components/views/SettingsView.tsx',
            './src/components/views/settings/AppearanceSettings.tsx',
            './src/components/views/settings/MapSettings.tsx',
            './src/components/views/RoepediaView.tsx',
          ],
          // DebugPanel split — recharts now in vendor_charts, so this stays lean
          'debug-panel': [
            './src/components/widgets/DebugPanel.tsx',
          ],
          onboarding: [
            './src/components/overlay/BootSequence.tsx',
            './src/components/overlay/CompanionGuideOverlay.tsx',
          ],
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts']
  }
});
