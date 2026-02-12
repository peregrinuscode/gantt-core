import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // Dev mode: serve the demo page
  if (mode === 'development') {
    return {
      plugins: [react()],
      root: 'demo',
      resolve: {
        alias: {
          '@peregrinus/gantt-core': resolve(__dirname, 'src/index.ts'),
        },
      },
    };
  }

  // Production: build as library
  return {
    plugins: [
      react(),
      dts({
        include: ['src'],
        outDir: 'dist',
        rollupTypes: true,
      }),
    ],
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'GanttCore',
        fileName: 'gantt-core',
        formats: ['es'],
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
          },
        },
      },
    },
  };
});
