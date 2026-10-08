import { defineConfig } from 'vite';
import Sitemap from 'vite-plugin-sitemap';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import fs from 'fs';
import { resolve } from 'path';

// Helper to grab all html files in the root dir
const getHtmlRoutes = () => {
  const files = fs.readdirSync('.');
  return files
    .filter(file => file.endsWith('.html'))
    .map(file => '/' + file);
};

// Map HTML files for Vite's rollup builder
const rollupInput = {};
getHtmlRoutes().forEach(route => {
  const name = route.replace('/', '').replace('.html', '') || 'main';
  const filePath = resolve(process.cwd(), route.replace('/', ''));
  rollupInput[name] = filePath;
});

// Ensure the output directory exists so vite-plugin-sitemap doesn't crash
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

export default defineConfig({
  plugins: [
    nodePolyfills(),
    Sitemap({
      hostname: 'https://beyondbloomre.com',
      outDir: 'dist',
      dynamicRoutes: getHtmlRoutes(),
      generateRobotsTxt: true
    })
  ],
  build: {
    outDir: 'dist', 
    rollupOptions: {
      input: rollupInput
    }
  }
});
