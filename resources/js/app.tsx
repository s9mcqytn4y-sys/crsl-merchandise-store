import '../css/app.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import type { ResolvedComponent } from '@inertiajs/react';

createInertiaApp({
    title: (title) => title ? `${title} - CRSL Store` : 'CRSL Official Store',
    resolve: (name): ResolvedComponent | Promise<ResolvedComponent> => {
        const pages = import.meta.glob<ResolvedComponent>(
            [
                './pages/**/*.jsx',
                './pages/**/*.tsx',
                './Pages/**/*.jsx',
                './Pages/**/*.tsx',
            ],
            { eager: true }
        );

        const page =
            pages[`./pages/${name}.jsx`] ??
            pages[`./pages/${name}.tsx`] ??
            pages[`./Pages/${name}.jsx`] ??
            pages[`./Pages/${name}.tsx`];

        if (!page) {
            throw new Error(`Inertia page [${name}] tidak ditemukan di ./pages/ atau ./Pages/`);
        }

        return page;
    },
    setup({ el, App, props }) {
        if (!el) {
            throw new Error('Root element #app tidak ditemukan.');
        }
        createRoot(el).render(<App {...props} />);
    },
});
