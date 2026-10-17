import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 7001,
    strictPort: true,
    open: false
  },
  preview: {
    port: 7001,
    strictPort: true
  }
});
