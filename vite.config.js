import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        admin: resolve(import.meta.dirname, 'admin/index.html'),
        agency: resolve(import.meta.dirname, 'agency.html'),
        commercial: resolve(import.meta.dirname, 'commercial.html'),
        listings: resolve(import.meta.dirname, 'listings.html'),
        offPlan: resolve(import.meta.dirname, 'off-plan.html'),
        privacyPolicy: resolve(import.meta.dirname, 'privacy-policy.html'),
        property: resolve(import.meta.dirname, 'property.html'),
        sellers: resolve(import.meta.dirname, 'sellers.html'),
        terms: resolve(import.meta.dirname, 'terms.html'),
      },
    },
  },
});
