import path from 'node:path';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@containers': path.resolve(__dirname, 'src/containers'),
      '@contexts': path.resolve(__dirname, 'src/contexts'),
      '@controllers': path.resolve(__dirname, 'src/controllers'),
      '@core': path.resolve(__dirname, 'src/core'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@modals': path.resolve(__dirname, 'src/modals'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@helpers': path.resolve(__dirname, 'src/helpers'),
      '@routes': path.resolve(__dirname, 'src/routes'),
    },
  },
  server: {
    port: 3010,
  },
});
