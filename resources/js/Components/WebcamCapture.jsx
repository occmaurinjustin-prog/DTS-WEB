import React, { useRef, useCallback, useState, useEffect } from 'react';
import Webcam from 'react-webcam';

export default function WebcamCapture({ onCapture, onCancel }) {
    const webcamRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const capture = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            onCapture(imageSrc);
        }
    }, [webcamRef, onCapture]);

    return (
        <div className="relative w-full max-w-md mx-auto bg-black rounded-2xl overflow-hidden shadow-inner">
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                    Initializing camera...
                </div>
            )}
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "user" }}
                onUserMedia={() => setIsLoaded(true)}
                className="w-full h-auto"
            />
            
            {isLoaded && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white text-sm font-medium rounded-full backdrop-blur transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={capture}
                        className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold rounded-full shadow-lg shadow-emerald-500/30 transition"
                    >
                        Capture
                    </button>
                </div>
            )}
        </div>
    );
}
