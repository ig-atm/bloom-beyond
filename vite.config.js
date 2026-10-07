import { defineConfig } from 'vite';
import Sitemap from 'vite-plugin-sitemap';
import fs from 'fs';

// Helper to grab all html files in the root dir to populate the sitemap
const getHtmlRoutes = () => {
  const files = fs.readdirSync('.');
  return files
    .filter(file => file.endsWith('.html'))
    .map(file => '/' + file);
};

// Ensure the output directory exists so vite-plugin-sitemap doesn't crash
if (!fs.existsSync('public/dist')) {
  fs.mkdirSync('public/dist', { recursive: true });
}

export default defineConfig({
  plugins: [
    Sitemap({
      hostname: 'https://beyondbloomre.com',
      outDir: 'public/dist',
      dynamicRoutes: getHtmlRoutes(),
      generateRobotsTxt: true
    })
  ],
  build: {
    // Optionally output the standard build files to public/dist as well,
    // or just let it build normally while the sitemap goes to public/dist.
    outDir: 'dist', 
  }
});
