import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: true,
  },
  build: {
    target: 'esnext',
    cssMinify: true,
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/three/') && !id.includes('@react-three')) {
            return 'three-core';
          }
          if (id.includes('/node_modules/@react-three/')) {
            return 'react-three';
          }
          if (id.includes('/node_modules/lucide-react/')) {
            return 'lucide-icons';
          }
        },
      },
    },
  },
});
