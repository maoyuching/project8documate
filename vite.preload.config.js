import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'node18.12',
    lib: {
      entry: 'src/preload/preload.js',
      formats: ['cjs'],
      fileName: () => 'preload.js',
    },
    rollupOptions: {
      external: ['electron'],
    },
  },
});
