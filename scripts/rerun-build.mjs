import { build } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
process.chdir(resolve(__dirname, '..'));

console.log('Starting Vite production build');
await build({ logLevel: 'info', build: { target: 'esnext', minify: false, assetsInlineLimit: 0, rollupOptions: { output: { inlineDynamicImports: false, manualChunks: undefined, chunkFileNames: 'assets/[name]-[hash].js', entryFileNames: 'assets/[name]-[hash].js', assetFileNames: 'assets/[name]-[hash].[ext]' } } } });
console.log('Vite production build complete');
