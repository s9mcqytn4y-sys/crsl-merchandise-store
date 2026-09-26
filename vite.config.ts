import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(import.meta.dirname, './resources/js'),
        },
    },
    build: {
        chunkSizeWarningLimit: 2500,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('react') || id.includes('@inertiajs')) {
                            return 'vendor-react';
                        }
                        if (id.includes('gsap')) {
                            return 'vendor-gsap';
                        }
                        if (id.includes('lucide-react') || id.includes('@headlessui') || id.includes('@heroicons')) {
                            return 'vendor-ui';
                        }
                        return 'vendor';
                    }
                },
            },
        },
    },
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
