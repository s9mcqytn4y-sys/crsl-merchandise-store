import React from 'react';
import { Head } from '@inertiajs/react';

export default function Beranda() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6">
            <Head title="CRSL Official Store" />
            <h1 className="text-3xl font-extrabold text-red-600 mb-2">
                CRSL Official Store v2
            </h1>
            <p className="text-slate-600 font-medium">
                Animals as your Bestfriends! (Modular Monolith v2)
            </p>
        </div>
    );
}
