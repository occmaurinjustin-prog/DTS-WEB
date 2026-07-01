import React from 'react';

export default function CaptureProgress({ current, total, instruction }) {
    const percentage = Math.round((current / total) * 100);

    return (
        <div className="mb-4">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h4 className="text-sm font-bold text-slate-800">Face Registration</h4>
                    <p className="text-xs text-slate-500">{instruction}</p>
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    {current} / {total} Captures
                </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
}
