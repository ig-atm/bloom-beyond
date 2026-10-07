import { defineConfig } from 'vite';
import sitemap from 'vite-plugin-sitemap';

export default defineConfig({
  plugins: [
    sitemap({
      hostname: 'https://beyondbloomre.com', // Base URL of your site
      dynamicRoutes: [
        '/buy',
        '/rent',
        '/off-plan',
        '/communities'
      ]
    })
  ],
  // Configuration for vite-ssg
  ssgOptions: {
    script: 'async', // Load scripts asynchronously
    formatting: 'minify', // Minify generated HTML
    // Define the routes to pre-render at build time
    includedRoutes(paths, routes) {
      const coreRoutes = [
        '/',
        '/buy',
        '/rent',
        '/off-plan',
        '/communities'
      ];
      
      // If you fetch dynamic property IDs, you would dynamically append them here.
      // Example: const propertyRoutes = properties.map(p => `/property/${p.id}`);
      // return [...coreRoutes, ...propertyRoutes];

      return coreRoutes;
    }
  }
});
