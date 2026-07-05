import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Play, Pause, Search, Navigation } from 'lucide-react';

export default function ReplayCenter({ authUser, deliveries }) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const marker = useRef(null);
    const animationFrame = useRef(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [pathData, setPathData] = useState([]);
    
    // Playback state
    const [isPlaying, setIsPlaying] = useState(false);
    const [progressIndex, setProgressIndex] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [isLoadingPath, setIsLoadingPath] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);

    // Filter deliveries based on search
    const filteredDeliveries = deliveries.filter(d => 
        d.waybill.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.client?.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.driver?.user?.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.driver?.user?.lastname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Initialize Map
    useEffect(() => {
        if (!mapContainer.current || map.current || !mapboxgl) return;

        try {
            console.log('Initializing ReplayCenter Mapbox...');
            mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/outdoors-v11',
                center: [120.9842, 14.5995],
                zoom: 12
            });

            map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

            map.current.on('load', () => {
                console.log('ReplayCenter Mapbox loaded successfully');
                map.current.resize();
                setMapLoaded(true);
            });

            map.current.on('error', (e) => {
                console.error('ReplayCenter Mapbox error:', e);
            });
        } catch (error) {
            console.error('Failed to initialize ReplayCenter Mapbox:', error);
        }

        // We DO NOT remove the map in cleanup because React 18 strict mode
        // will destroy it and fail to recreate it properly sometimes.
        return () => {
            if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
        };
    }, []);

    // Fetch path when delivery is selected
    useEffect(() => {
        if (!selectedDelivery) return;

        setIsLoadingPath(true);
        setPathData([]);
        setProgressIndex(0);
        setIsPlaying(false);

        // Remove old marker
        if (marker.current) {
            marker.current.remove();
            marker.current = null;
        }

        fetch(`/api/admin/driver-path/${selectedDelivery.driver_id}?delivery_id=${selectedDelivery.delivery_id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.path) {
                    setPathData(data.path);
                }
            })
            .catch(err => console.error('Failed to fetch path:', err))
            .finally(() => setIsLoadingPath(false));
    }, [selectedDelivery]);

    // Draw path on map
    useEffect(() => {
        if (!mapLoaded || !map.current || !map.current.isStyleLoaded() || pathData.length === 0) return;

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
    }, [pathData, mapLoaded]);

    // Animation Loop
    useEffect(() => {
        let lastTimestamp = 0;
        const tickRate = 1000 / (10 * playbackSpeed);

        const animateMarker = (timestamp) => {
            if (!isPlaying) return;

            if (timestamp - lastTimestamp >= tickRate) {
                setProgressIndex(prev => {
                    const next = prev + 1;
                    if (next >= pathData.length) {
                        setIsPlaying(false);
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
        
        if (isPlaying && map.current) {
            map.current.panTo([Number(pt.longitude), Number(pt.latitude)], { duration: 200 });
        }
    }, [progressIndex, pathData, isPlaying]);

    const currentPoint = pathData[progressIndex];

    return (
        <AdminLayout activeMenu="replay-center" title="Replay Center">
            <div className="h-[calc(100vh-6rem)] flex gap-4">
                
                {/* Left Sidebar - Delivery List */}
                <div className="w-96 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50">
                        <h2 className="text-lg font-bold text-slate-800">Completed Routes</h2>
                        <p className="text-xs text-slate-500 mb-3">Select a delivery to view its GPS history</p>
                        
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search waybill, client, driver..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {filteredDeliveries.length > 0 ? (
                            filteredDeliveries.map(delivery => (
                                <button
                                    key={delivery.delivery_id}
                                    onClick={() => setSelectedDelivery(delivery)}
                                    className={`w-full text-left p-3 rounded-xl transition-all ${
                                        selectedDelivery?.delivery_id === delivery.delivery_id
                                            ? 'bg-blue-50 border border-blue-200 ring-1 ring-blue-500/50'
                                            : 'hover:bg-slate-50 border border-transparent'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-semibold text-slate-900 text-sm">#{delivery.waybill}</span>
                                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                            {new Date(delivery.delivered_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-600 mb-1 truncate">
                                        <span className="font-medium text-slate-700">Client:</span> {delivery.client?.client_name}
                                    </div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                        <div className="w-4 h-4 bg-slate-200 rounded-full flex items-center justify-center">
                                            <span className="text-[8px] font-bold text-slate-600">
                                                {delivery.driver?.user?.firstname?.charAt(0)}
                                            </span>
                                        </div>
                                        {delivery.driver?.user?.firstname} {delivery.driver?.user?.lastname}
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="p-8 text-center text-slate-500 text-sm">
                                No completed deliveries found.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side - Map and Controls */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden relative">
                    
                    {/* Main Map View */}
                    <div className="flex-1 relative bg-slate-100 min-h-[500px]">
                        {!selectedDelivery && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                                <Navigation className="w-16 h-16 text-slate-300 mb-4" />
                                <h3 className="text-xl font-bold text-slate-700">Replay Center</h3>
                                <p className="text-slate-500">Select a delivery from the list to view its route playback.</p>
                            </div>
                        )}
                        
                        {isLoadingPath && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        )}

                        {(!isLoadingPath && selectedDelivery && pathData.length === 0) && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                                <h3 className="text-lg font-medium text-slate-600">No GPS History Found</h3>
                                <p className="text-slate-400">There is no location data recorded for this delivery.</p>
                            </div>
                        )}

                        <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
                    </div>

                    {/* Playback Controls Footer */}
                    {selectedDelivery && pathData.length > 0 && (
                        <div className="bg-white border-t border-slate-200 p-5 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] relative z-20">
                            
                            <div className="flex items-center space-x-4 mb-4">
                                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Start</span>
                                <input
                                    type="range"
                                    min="0"
                                    max={pathData.length - 1}
                                    value={progressIndex}
                                    onChange={(e) => {
                                        setProgressIndex(parseInt(e.target.value));
                                        setIsPlaying(false);
                                    }}
                                    className="flex-1 h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700"
                                />
                                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Finish</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <button 
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className="w-12 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors focus:ring-4 ring-blue-200"
                                    >
                                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                                    </button>
                                    
                                    <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                                        {[1, 2, 5, 10].map(speed => (
                                            <button
                                                key={speed}
                                                onClick={() => setPlaybackSpeed(speed)}
                                                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all ${
                                                    playbackSpeed === speed 
                                                        ? 'bg-white shadow text-blue-600' 
                                                        : 'text-slate-500 hover:text-slate-800'
                                                }`}
                                            >
                                                {speed}x
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="text-right bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                                    <div className="text-sm font-bold text-slate-800 flex items-center justify-end gap-2">
                                        {currentPoint?.speed || 0} km/h
                                        <span className={`w-2 h-2 rounded-full ${currentPoint?.was_offline ? 'bg-orange-500' : 'bg-emerald-500'}`}></span>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                        {currentPoint ? new Date(currentPoint.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
                                        {' • '}
                                        {currentPoint?.was_offline ? 'Offline Queue' : 'Live Sync'}
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
}
