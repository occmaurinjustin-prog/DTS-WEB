import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import OperationalManagerLayout from '@/Layouts/OperationalManagerLayout';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Play, Pause, Search, Navigation } from 'lucide-react';

export default function ReplayCenter({ authUser, deliveries }) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const marker = useRef(null);
    const pickupMarker = useRef(null);
    const dropoffMarker = useRef(null);
    const animationFrame = useRef(null);

    const calculateBearing = (startLat, startLng, destLat, destLng) => {
        const toRad = (degree) => (degree * Math.PI) / 180;
        const toDeg = (rad) => (rad * 180) / Math.PI;

        const lat1 = toRad(startLat);
        const lon1 = toRad(startLng);
        const lat2 = toRad(destLat);
        const lon2 = toRad(destLng);

        const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
        let brng = Math.atan2(y, x);

        return (toDeg(brng) + 360) % 360;
    };

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

        // Remove old markers
        if (marker.current) {
            marker.current.remove();
            marker.current = null;
        }
        if (pickupMarker.current) {
            pickupMarker.current.remove();
            pickupMarker.current = null;
        }
        if (dropoffMarker.current) {
            dropoffMarker.current.remove();
            dropoffMarker.current = null;
        }

        fetch(`/operational-manager/api/driver-path/${selectedDelivery.driver_id}?delivery_id=${selectedDelivery.delivery_id}`)
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
        if (!mapLoaded || !map.current || !map.current.isStyleLoaded() || pathData.length === 0 || !selectedDelivery) return;

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

        // Fit bounds including pickup/dropoff
        const bounds = new mapboxgl.LngLatBounds();
        pathData.forEach(p => bounds.extend([Number(p.longitude), Number(p.latitude)]));
        if (selectedDelivery.pickup_longitude && selectedDelivery.pickup_latitude) {
            bounds.extend([Number(selectedDelivery.pickup_longitude), Number(selectedDelivery.pickup_latitude)]);
        }
        if (selectedDelivery.delivery_longitude && selectedDelivery.delivery_latitude) {
            bounds.extend([Number(selectedDelivery.delivery_longitude), Number(selectedDelivery.delivery_latitude)]);
        }
        map.current.fitBounds(bounds, { padding: 50 });

        // Initialize Marker
        if (!marker.current) {
            const el = document.createElement('div');
            el.className = 'w-10 h-10 flex items-center justify-center';
            el.innerHTML = `
                <div class="truck-icon-inner bg-white rounded-full p-2 shadow-[0_0_15px_rgba(59,130,246,0.5)] border-2 border-blue-500 transition-transform duration-300 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" class="text-blue-600">
                        <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                    </svg>
                </div>
            `;

            marker.current = new mapboxgl.Marker({ 
                element: el, 
                anchor: 'center',
                pitchAlignment: 'map',
                rotationAlignment: 'map'
            })
                .setLngLat([Number(pathData[0].longitude), Number(pathData[0].latitude)])
                .addTo(map.current);
        }

        // Initialize Pickup Marker
        if (!pickupMarker.current && selectedDelivery.pickup_latitude && selectedDelivery.pickup_longitude) {
            const el = document.createElement('div');
            el.className = 'w-8 h-8 flex items-center justify-center relative -top-4';
            el.innerHTML = `
                <div class="bg-emerald-500 text-white rounded-full p-1.5 shadow-lg border-2 border-white flex items-center justify-center relative">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                    <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-500 rotate-45 z-[-1]"></div>
                </div>
            `;
            pickupMarker.current = new mapboxgl.Marker({ 
                element: el, 
                anchor: 'bottom',
                pitchAlignment: 'map',
                rotationAlignment: 'map'
            })
                .setLngLat([Number(selectedDelivery.pickup_longitude), Number(selectedDelivery.pickup_latitude)])
                .addTo(map.current);
        }

        // Initialize Dropoff Marker
        if (!dropoffMarker.current && selectedDelivery.delivery_latitude && selectedDelivery.delivery_longitude) {
            const el = document.createElement('div');
            el.className = 'w-8 h-8 flex items-center justify-center relative -top-4';
            el.innerHTML = `
                <div class="bg-rose-500 text-white rounded-full p-1.5 shadow-lg border-2 border-white flex items-center justify-center relative">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-rose-500 rotate-45 z-[-1]"></div>
                </div>
            `;
            dropoffMarker.current = new mapboxgl.Marker({ 
                element: el, 
                anchor: 'bottom',
                pitchAlignment: 'map',
                rotationAlignment: 'map'
            })
                .setLngLat([Number(selectedDelivery.delivery_longitude), Number(selectedDelivery.delivery_latitude)])
                .addTo(map.current);
        }
    }, [pathData, mapLoaded, selectedDelivery]);

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
        const markerEl = marker.current.getElement();

        // Smooth translation using CSS transition
        if (isPlaying) {
            const transitionDuration = 1000 / (10 * playbackSpeed);
            markerEl.style.transition = `transform ${transitionDuration}ms linear`;
        } else {
            markerEl.style.transition = 'none';
        }

        marker.current.setLngLat([Number(pt.longitude), Number(pt.latitude)]);

        // Handle rotation for the inner truck element
        if (progressIndex > 0) {
            const prevPt = pathData[progressIndex - 1];
            // Only rotate if the points are different to avoid jumping to 0
            if (prevPt.latitude !== pt.latitude || prevPt.longitude !== pt.longitude) {
                const bearing = calculateBearing(
                    Number(prevPt.latitude), Number(prevPt.longitude),
                    Number(pt.latitude), Number(pt.longitude)
                );

                const innerEl = markerEl.querySelector('.truck-icon-inner');
                if (innerEl) {
                    // SVG navigation arrow faces up (North). Mapbox bearing 0 is North.
                    innerEl.style.transform = `rotate(${bearing}deg)`;
                }
            }
        }

        if (isPlaying && map.current) {
            map.current.panTo([Number(pt.longitude), Number(pt.latitude)], { duration: 200, animate: true, easing: (t) => t });
        }
    }, [progressIndex, pathData, isPlaying, playbackSpeed]);

    const currentPoint = pathData[progressIndex];

    return (
        <OperationalManagerLayout activeMenu="replay-center" title="Replay Center">
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
                                    className={`group w-full text-left p-3.5 rounded-xl transition-all duration-200 ${selectedDelivery?.delivery_id === delivery.delivery_id
                                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50/30 border border-blue-200 shadow-sm ring-1 ring-blue-500/20 transform scale-[1.02]'
                                            : 'hover:bg-slate-50 border border-transparent hover:border-slate-200/60'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-semibold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">#{delivery.waybill}</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${selectedDelivery?.delivery_id === delivery.delivery_id
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-emerald-50 text-emerald-600'
                                            }`}>
                                            {new Date(delivery.delivered_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-600 mb-1.5 truncate">
                                        <span className="font-medium text-slate-400">Client:</span> <span className="font-medium">{delivery.client?.client_name}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shadow-sm ${selectedDelivery?.delivery_id === delivery.delivery_id
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            <span className="text-[9px] font-bold">
                                                {delivery.driver?.user?.firstname?.charAt(0)}
                                            </span>
                                        </div>
                                        <span className="font-medium">{delivery.driver?.user?.firstname} {delivery.driver?.user?.lastname}</span>
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

                        <div ref={mapContainer} className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden" />

                        {/* Floating Playback Controls Overlay */}
                        {selectedDelivery && pathData.length > 0 && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-white/85 backdrop-blur-xl border border-white/50 p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-20 transition-all duration-300 hover:bg-white/95 hover:shadow-[0_8px_40px_rgb(0,0,0,0.16)]">

                                <div className="flex items-center space-x-4 mb-5">
                                    <span className="text-xs text-slate-500 font-bold tracking-wide uppercase">Start</span>
                                    <input
                                        type="range"
                                        min="0"
                                        max={pathData.length - 1}
                                        value={progressIndex}
                                        onChange={(e) => {
                                            setProgressIndex(parseInt(e.target.value));
                                            setIsPlaying(false);
                                        }}
                                        className="flex-1 h-2 bg-slate-200/80 rounded-full appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-all shadow-inner"
                                    />
                                    <span className="text-xs text-slate-500 font-bold tracking-wide uppercase">Finish</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-5">
                                        <button
                                            onClick={() => setIsPlaying(!isPlaying)}
                                            className="w-12 h-12 flex items-center justify-center bg-gradient-to-tr from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white rounded-full shadow-lg hover:shadow-blue-500/40 transition-all focus:ring-4 ring-blue-200 transform hover:scale-105 active:scale-95"
                                        >
                                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                                        </button>

                                        <div className="flex bg-slate-100/80 backdrop-blur-sm rounded-xl p-1.5 border border-slate-200/60 shadow-inner">
                                            {[1, 2, 5, 10].map(speed => (
                                                <button
                                                    key={speed}
                                                    onClick={() => setPlaybackSpeed(speed)}
                                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${playbackSpeed === speed
                                                            ? 'bg-white shadow-sm text-blue-700 scale-105'
                                                            : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                                                        }`}
                                                >
                                                    {speed}x
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="text-right bg-white/60 backdrop-blur-md px-5 py-2.5 rounded-xl border border-slate-200/50 shadow-sm">
                                        <div className="text-sm font-black text-slate-800 flex items-center justify-end gap-2.5 tracking-tight">
                                            {currentPoint?.speed || 0} <span className="text-xs font-semibold text-slate-400">KM/H</span>
                                            <span className={`w-2 h-2 rounded-full shadow-sm ${currentPoint?.was_offline ? 'bg-orange-500 shadow-orange-500/50' : 'bg-emerald-500 shadow-emerald-500/50'}`}></span>
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
                                            {currentPoint ? new Date(currentPoint.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
                                            <span className="mx-1.5 opacity-50">•</span>
                                            <span className={currentPoint?.was_offline ? 'text-orange-600' : 'text-emerald-600'}>
                                                {currentPoint?.was_offline ? 'Offline Queue' : 'Live Sync'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </OperationalManagerLayout>
    );
}
