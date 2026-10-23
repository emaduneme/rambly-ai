import { resolve } from 'path';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        confirmed: resolve(__dirname, 'confirmed.html'),
        privacy: resolve(__dirname, 'privacy.html'),
      },
    },
  },
});
