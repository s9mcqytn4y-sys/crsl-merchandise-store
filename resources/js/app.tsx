import '../css/app.css';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import type { ResolvedComponent } from '@inertiajs/react';

import ErrorBoundary from './Components/ErrorBoundary';

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
        createRoot(el).render(
            <ErrorBoundary>
                <App {...props} />
            </ErrorBoundary>
        );
    },
});
