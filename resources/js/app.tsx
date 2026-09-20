import '../css/app.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';

createInertiaApp({
    title: (title) => title ? `${title} - CRSL Store` : 'CRSL Official Store',
    resolve: (name) => {
        const pages = import.meta.glob([
            './pages/**/*.jsx',
            './pages/**/*.tsx',
            './Pages/**/*.jsx',
            './Pages/**/*.tsx',
        ], { eager: true });

        const page = pages[`./pages/${name}.jsx`]
            || pages[`./pages/${name}.tsx`]
            || pages[`./Pages/${name}.jsx`]
            || pages[`./Pages/${name}.tsx`];

        if (!page) {
            throw new Error(`Inertia page [${name}] not found in ./pages/ or ./Pages/`);
        }

        return page;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
