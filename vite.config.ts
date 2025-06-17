// eslint-disable-next-line import/no-unassigned-import
import 'vitest/config';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { externalizeDeps } from 'vite-plugin-externalize-deps';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/index.ts',
            fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
            formats: ['es', 'cjs'],
        },
        outDir: 'dist',
        sourcemap: true,
    },
    define: { 'process.env.NODE_ENV': "'production'" },
    plugins: [
        react(),
        dts({
            tsconfigPath: './tsconfig.build.json',
        }),
        externalizeDeps(),
    ],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./setup.ts'],
    },
});
