// eslint-disable-next-line import/no-unassigned-import
import 'vitest/config';
import packageJson from './package.json';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/index.ts',
            fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
            formats: ['es', 'cjs'],
        },
        outDir: 'dist',
        rollupOptions: {
            external: [
                ...Object.keys(packageJson.dependencies || {}),
                'react-dom/client',
                'react/jsx-runtime',
            ],
        },
        sourcemap: true,
    },
    define: { 'process.env.NODE_ENV': "'production'" },
    plugins: [
        react(),
        dts({
            tsconfigPath: './tsconfig.build.json',
        }),
    ],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./setup.ts'],
    },
});
