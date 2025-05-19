import { defineConfig } from '@ladle/react';
import postcssConfig from './postcss.config.mjs';
import react from '@vitejs/plugin-react';

export default defineConfig({
  stories: ['src/**/*.stories.tsx'],
  addons: [
    '@ladle/addon-controls',
    '@ladle/addon-actions',
    '@ladle/addon-themes',
  ],
  vite: {
    plugins: [react()],
    css: {
      postcss: postcssConfig,
    },
    optimizeDeps: {
      include: ['tailwindcss', 'postcss', 'autoprefixer'],
    },
  }
}); 