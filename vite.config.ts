/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/lucide-react')) {
            return 'lucide';
          }
          if (id.includes('node_modules/canvas-confetti')) {
            return 'confetti';
          }
          if (id.includes('src/data/boards/')) {
            const match = id.match(/boards\/([a-zA-Z]+)\.json/);
            if (match) return `board-${match[1]}`;
          }
          if (id.includes('src/data/categories/')) {
            return 'dictionaries';
          }
        },
      },
    },
  },
  test: {
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./src/tests/setup.ts'],
  },
});
