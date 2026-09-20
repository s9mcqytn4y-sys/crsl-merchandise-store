import React from 'react';

export default function TestTailwind() {
    return (
        <main className="min-h-screen flex items-center justify-center p-6 bg-slate-900">
            <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-2xl border-t-4 border-red-500 text-center space-y-4">
                <span className="inline-block px-3 py-1 bg-red-100 text-red-600 text-xs font-bold uppercase tracking-wider rounded-full">
                    Tailwind v4 Active
                </span>
                <h1 className="text-2xl font-black text-gray-900">
                    CRSL Monolith Ready
                </h1>
                <p className="text-sm text-gray-600">
                    Jika kartu ini berada tepat di tengah dengan background gelap dan badge merah, kompilasi Vite + Tailwind v4 berhasil 100%.
                </p>
                <button className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 cursor-pointer">
                    Tombol Interaktif
                </button>
            </div>
        </main>
    );
}
