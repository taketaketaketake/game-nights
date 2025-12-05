import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [
    react(),
    tailwind()
  ],
  output: 'hybrid', // Allows mix of static and server-rendered pages
  server: {
    port: 4321,
    host: true
  }
});
