import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { univerPlugin } from '@univerjs/vite-plugin';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), univerPlugin()],
  resolve: {
    alias: {
      '@chang-code-hub/luckyexcel-fixed': '/Projects/Self/luckyexcel-fixed/dist/luckyexcel.esm.js',
    },
  },
});
