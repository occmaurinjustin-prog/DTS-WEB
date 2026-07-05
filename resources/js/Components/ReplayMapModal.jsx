import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Play, Pause, FastForward, Rewind, X, Navigation } from 'lucide-react';

export default function ReplayMapModal({ deliveryId, driverId, isOpen, onClose }) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const marker = useRef(null);
    const animationFrame = useRef(null);

    const [pathData, setPathData] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progressIndex, setProgressIndex] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch path when opened
    useEffect(() => {
        if (!isOpen || !deliveryId || !driverId) return;

        setIsLoading(true);
        setPathData([]);
        setProgressIndex(0);
        setIsPlaying(false);

        fetch(`/api/drivers/${driverId}/path?delivery_id=${deliveryId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.path && data.path.length > 0) {
                    setPathData(data.path);
                }
            })
            .catch(err => console.error('Failed to fetch replay path:', err))
            .finally(() => setIsLoading(false));
    }, [isOpen, deliveryId, driverId]);

    // Initialize map
    useEffect(() => {
        if (!isOpen || !mapContainer.current) return;

        if (!map.current) {
            mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/outdoors-v11',
                center: [120.9842, 14.5995],
                zoom: 12
            });

            map.current.on('load', () => {
                map.current.resize();
            });
        }

        return () => {
            if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [isOpen]);

    // Draw path and fit bounds when data loads
    useEffect(() => {
        if (!map.current || pathData.length === 0) return;

        const loadPath = () => {
            const onlineCoords = pathData.filter(p => !p.was_offline).map(p => [Number(p.longitude), Number(p.latitude)]);
            const offlineCoords = pathData.filter(p => p.was_offline).map(p => [Number(p.longitude), Number(p.latitude)]);

            // Clear old layers
            ['route-online', 'route-offline'].forEach(layer => {
                if (map.current.getLayer(layer)) map.current.removeLayer(layer);
                if (map.current.getSource(layer)) map.current.removeSource(layer);
            });

            // Draw online path
            if (onlineCoords.length >= 2) {
                map.current.addSource('route-online', {
                    type: 'geojson',
                    data: { type: 'Feature', geometry: { type: 'LineString', coordinates: onlineCoords } }
                });
                map.current.addLayer({
                    id: 'route-online',
                    type: 'line',
                    source: 'route-online',
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: { 'line-color': '#3B82F6', 'line-width': 4, 'line-opacity': 0.7 }
                });
            }

            // Draw offline path
            if (offlineCoords.length >= 2) {
                map.current.addSource('route-offline', {
                    type: 'geojson',
                    data: { type: 'Feature', geometry: { type: 'LineString', coordinates: offlineCoords } }
                });
                map.current.addLayer({
                    id: 'route-offline',
                    type: 'line',
                    source: 'route-offline',
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: { 'line-color': '#F97316', 'line-width': 4, 'line-opacity': 0.8, 'line-dasharray': [2, 2] }
                });
            }

            // Fit bounds
            const bounds = new mapboxgl.LngLatBounds();
            pathData.forEach(p => bounds.extend([Number(p.longitude), Number(p.latitude)]));
            map.current.fitBounds(bounds, { padding: 50 });

            // Initialize Marker
            if (!marker.current) {
                const el = document.createElement('div');
                el.className = 'w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg shadow-blue-500/50';
                
                marker.current = new mapboxgl.Marker({ element: el })
                    .setLngLat([Number(pathData[0].longitude), Number(pathData[0].latitude)])
                    .addTo(map.current);
            }
        };

        if (map.current.isStyleLoaded()) {
            loadPath();
        } else {
            map.current.once('load', loadPath);
        }
    }, [pathData]);

    // Animation Loop
    useEffect(() => {
        let lastTimestamp = 0;
        const tickRate = 1000 / (10 * playbackSpeed); // approximate speed

        const animateMarker = (timestamp) => {
            if (!isPlaying) return;

            if (timestamp - lastTimestamp >= tickRate) {
                setProgressIndex(prev => {
                    const next = prev + 1;
                    if (next >= pathData.length) {
                        setIsPlaying(false); // Stop at end
                        return prev;
                    }
                    return next;
                });
                lastTimestamp = timestamp;
            }

            if (isPlaying) {
                animationFrame.current = requestAnimationFrame(animateMarker);
            }
        };

        if (isPlaying) {
            animationFrame.current = requestAnimationFrame(animateMarker);
        } else if (animationFrame.current) {
            cancelAnimationFrame(animationFrame.current);
        }

        return () => {
            if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
        };
    }, [isPlaying, pathData.length, playbackSpeed]);

    // Update marker position when index changes
    useEffect(() => {
        if (!marker.current || pathData.length === 0 || !pathData[progressIndex]) return;

        const pt = pathData[progressIndex];
        marker.current.setLngLat([Number(pt.longitude), Number(pt.latitude)]);
        
        // Follow marker with camera if playing
        if (isPlaying && map.current) {
            map.current.panTo([Number(pt.longitude), Number(pt.latitude)], { duration: 200 });
        }
    }, [progressIndex, pathData, isPlaying]);

    if (!isOpen) return null;

    const currentPoint = pathData[progressIndex];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden relative">
                
                {/* Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Route Replay Center</h2>
                        <p className="text-sm text-gray-500">Historical GPS tracking for Delivery #{deliveryId}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Map Area */}
                <div className="flex-1 relative bg-gray-100">
                    {isLoading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    )}
                    
                    {(!isLoading && pathData.length === 0) && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-50">
                            <Navigation className="w-12 h-12 text-gray-300 mb-2" />
                            <h3 className="text-lg font-medium text-gray-600">No Location History</h3>
                            <p className="text-gray-400">There is no recorded GPS path for this delivery.</p>
                        </div>
                    )}

                    <div ref={mapContainer} className="absolute inset-0" />
                </div>

                {/* Control Panel (Only show if we have data) */}
                {pathData.length > 0 && (
                    <div className="bg-white border-t p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                                <button 
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="w-12 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors focus:ring-4 ring-blue-200"
                                >
                                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                                </button>
                                
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    {[1, 2, 5, 10].map(speed => (
                                        <button
                                            key={speed}
                                            onClick={() => setPlaybackSpeed(speed)}
                                            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                                playbackSpeed === speed 
                                                    ? 'bg-white shadow text-blue-600' 
                                                    : 'text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {speed}x
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-sm font-bold text-gray-800">
                                    {currentPoint ? new Date(currentPoint.recorded_at).toLocaleTimeString() : '--:--:--'}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {currentPoint?.speed || 0} km/h • {currentPoint?.was_offline ? 'Offline Queue' : 'Live Sync'}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <span className="text-xs text-gray-500 font-medium">Start</span>
                            <input
                                type="range"
                                min="0"
                                max={pathData.length - 1}
                                value={progressIndex}
                                onChange={(e) => {
                                    setProgressIndex(parseInt(e.target.value));
                                    setIsPlaying(false); // Pause when scrubbing
                                }}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <span className="text-xs text-gray-500 font-medium">End</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
