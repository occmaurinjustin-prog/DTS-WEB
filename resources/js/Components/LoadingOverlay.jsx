import React from 'react';

export default function LoadingOverlay({ message = "Processing..." }) {
    return (
        <div className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
                <p className="text-sm font-semibold text-slate-800">{message}</p>
            </div>
        </div>
    );
}
