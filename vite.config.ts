import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// 画像のベースURL（GitHub raw URL に変更予定）
const IMAGE_BASE_URL = process.env.IMAGE_BASE_URL || '';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isSingleFile = env.SINGLE_FILE === 'true';

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: isSingleFile ? [react(), viteSingleFile()] : [react()],
      build: isSingleFile ? {
        // 単一HTMLにインライン化
        cssCodeSplit: false,
        assetsInlineLimit: 100000000,
        rollupOptions: {
          output: {
            manualChunks: undefined,
          },
        },
      } : {
        // 通常ビルド（JS分離）
        rollupOptions: {
          output: {
            entryFileNames: 'assets/app.js',
            chunkFileNames: 'assets/[name].js',
            assetFileNames: 'assets/[name].[ext]',
          },
        },
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.IMAGE_BASE_URL': JSON.stringify(env.IMAGE_BASE_URL || ''),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
