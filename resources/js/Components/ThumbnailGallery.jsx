import React from 'react';

export default function ThumbnailGallery({ images, onRetakeLast }) {
    if (images.length === 0) return null;

    return (
        <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
                <h5 className="text-xs font-semibold text-slate-700">Captured Images</h5>
                <button 
                    type="button"
                    onClick={onRetakeLast}
                    className="text-xs text-rose-500 hover:text-rose-600 font-medium"
                >
                    Retake Last
                </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
                {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                        <img src={img} alt={`Capture ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-tl">
                            {idx + 1}
                        </div>
                    </div>
                ))}
                {/* Placeholders for remaining */}
                {Array.from({ length: 10 - images.length }).map((_, idx) => (
                    <div key={`placeholder-${idx}`} className="aspect-square rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                        <span className="text-slate-300 text-xs">{images.length + idx + 1}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
