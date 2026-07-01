import React, { useState } from 'react';
import WebcamCapture from './WebcamCapture';
import CaptureProgress from './CaptureProgress';
import ThumbnailGallery from './ThumbnailGallery';

export default function FaceRegistrationSection({ images, setImages }) {
    const [isCapturing, setIsCapturing] = useState(false);
    const [error, setError] = useState(null);

    const instructions = [
        "1. Look straight at the camera (Front)",
        "2. Turn your head slightly to the left",
        "3. Turn your head more to the left",
        "4. Turn your head slightly to the right",
        "5. Turn your head more to the right",
        "6. Tilt your head up slightly",
        "7. Tilt your head down slightly",
        "8. Smile naturally",
        "9. Maintain a neutral expression",
        "10. Blink your eyes"
    ];

    const currentInstruction = images.length < 10 ? instructions[images.length] : "All captures complete!";

    const handleCapture = (imageSrc) => {
        // Here we could add client-side validation logic before accepting
        // For now, we trust the face API to reject bad images
        setError(null);
        if (images.length < 10) {
            setImages([...images, imageSrc]);
        }
        setIsCapturing(false);
    };

    const handleRetakeLast = () => {
        if (images.length > 0) {
            setImages(images.slice(0, -1));
        }
    };

    return (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-6">
            <CaptureProgress 
                current={images.length} 
                total={10} 
                instruction={currentInstruction} 
            />

            {error && (
                <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-xs font-semibold rounded-lg border border-rose-100">
                    {error}
                </div>
            )}

            {images.length < 10 ? (
                isCapturing ? (
                    <WebcamCapture 
                        onCapture={handleCapture} 
                        onCancel={() => setIsCapturing(false)} 
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 bg-white border-2 border-dashed border-emerald-200 rounded-xl">
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 text-emerald-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h4 className="text-sm font-bold text-slate-700 mb-1">Camera Ready</h4>
                        <p className="text-xs text-slate-500 mb-4 text-center max-w-xs">
                            Follow the instructions to capture 10 variations of your face for accurate recognition.
                        </p>
                        <button
                            type="button"
                            onClick={() => setIsCapturing(true)}
                            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold rounded-lg shadow-md shadow-emerald-500/20 transition-all"
                        >
                            Start Camera
                        </button>
                    </div>
                )
            ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700">
                    <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="font-bold">Registration Complete</h4>
                    <p className="text-xs opacity-80">All 10 images captured successfully.</p>
                </div>
            )}

            <ThumbnailGallery images={images} onRetakeLast={handleRetakeLast} />
        </div>
    );
}
