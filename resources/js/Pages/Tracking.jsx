import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
    Truck, MapPin, Navigation, Clock, Package, 
    CheckCircle2, ChevronLeft, ArrowRight, ShieldCheck,
    Activity, Map
} from 'lucide-react';

export default function Tracking({ delivery, currentLocation }) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const truckMarker = useRef(null);
    const pickupMarker = useRef(null);
    const deliveryMarker = useRef(null);
    const routeSourceId = 'route';
    const [mapLoaded, setMapLoaded] = useState(false);

    // Real-time polling
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['currentLocation', 'delivery'],
                preserveState: true,
                preserveScroll: true
            });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Get real route from Mapbox Directions API
    const fetchDirections = async (coordinates) => {
        if (!map.current || !mapLoaded || coordinates.length < 2) return;
        
        try {
            const coordsString = coordinates.map(c => `${c[0]},${c[1]}`).join(';');
            const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordsString}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.routes && data.routes[0]) {
                const routeGeoJSON = data.routes[0].geometry;
                if (map.current.getSource(routeSourceId)) {
                    map.current.getSource(routeSourceId).setData({
                        type: 'Feature',
                        properties: {},
                        geometry: routeGeoJSON
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch directions:', error);
        }
    };

    useEffect(() => {
        if (!mapContainer.current) return;

        if (!map.current) {
            mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
            
            let startLng = delivery.pickup_longitude || 121.0503;
            let startLat = delivery.pickup_latitude || 14.5823;
            
            if (currentLocation) {
                startLng = currentLocation.long;
                startLat = currentLocation.lat;
            }

            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/outdoors-v12', // Vibrant colored map
                center: [startLng, startLat],
                zoom: 12,
                pitch: 45, // 3D effect
            });

            map.current.on('load', () => {
                setMapLoaded(true);

                // Initialize Route Line Source
                map.current.addSource(routeSourceId, {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: []
                        }
                    }
                });

                map.current.addLayer({
                    id: 'route-line',
                    type: 'line',
                    source: routeSourceId,
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    paint: {
                        'line-color': '#3B82F6', // Beautiful Blue line
                        'line-width': 6,
                        'line-opacity': 0.8
                    }
                });

                updateMapData();
            });
        } else if (mapLoaded) {
            updateMapData();
        }

    }, [currentLocation, delivery, mapLoaded]);

    const updateMapData = () => {
        if (!map.current || !mapLoaded) return;

        const isPickedUp = delivery.delivery_status === 'in_transit' || delivery.delivery_status === 'delivered';

        // 1. Manage Pickup Marker (Hide if already picked up)
        if (!isPickedUp && delivery.pickup_longitude && delivery.pickup_latitude) {
            if (!pickupMarker.current) {
                const pickupEl = document.createElement('div');
                pickupEl.className = 'w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white';
                pickupEl.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
                
                pickupMarker.current = new mapboxgl.Marker(pickupEl)
                    .setLngLat([delivery.pickup_longitude, delivery.pickup_latitude])
                    .setPopup(new mapboxgl.Popup({ offset: 25, className: 'glass-popup text-slate-800' }).setHTML('<div class="p-2"><h3 class="font-bold text-slate-900">Origin</h3><p class="text-sm text-slate-500">Pickup Location</p></div>'))
                    .addTo(map.current);
            }
        } else if (isPickedUp && pickupMarker.current) {
            pickupMarker.current.remove();
            pickupMarker.current = null;
        }

        // 2. Manage Delivery Marker (Always visible)
        if (delivery.delivery_longitude && delivery.delivery_latitude) {
            if (!deliveryMarker.current) {
                const deliveryEl = document.createElement('div');
                deliveryEl.className = 'w-8 h-8 bg-emerald-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white';
                deliveryEl.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
                
                deliveryMarker.current = new mapboxgl.Marker(deliveryEl)
                    .setLngLat([delivery.delivery_longitude, delivery.delivery_latitude])
                    .setPopup(new mapboxgl.Popup({ offset: 25, className: 'glass-popup text-slate-800' }).setHTML('<div class="p-2"><h3 class="font-bold text-slate-900">Destination</h3><p class="text-sm text-slate-500">Drop-off Location</p></div>'))
                    .addTo(map.current);
            }
        }

        // 3. Manage Truck Marker
        if (currentLocation) {
            if (!truckMarker.current) {
                const truckEl = document.createElement('div');
                truckEl.className = 'w-10 h-10 bg-orange-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white z-50 transition-all duration-1000';
                
                const ring = document.createElement('div');
                ring.className = 'absolute inset-0 rounded-full border-4 border-orange-500 animate-ping opacity-75';
                truckEl.appendChild(ring);
                
                const icon = document.createElement('div');
                icon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>';
                icon.className = 'relative z-10';
                truckEl.appendChild(icon);
                
                truckMarker.current = new mapboxgl.Marker(truckEl)
                    .setLngLat([currentLocation.long, currentLocation.lat])
                    .setPopup(new mapboxgl.Popup({ offset: 25, className: 'text-slate-800' }).setHTML(`<div class="p-2"><h3 class="font-bold text-slate-900">Live Location</h3><p class="text-sm text-slate-500">Speed: ${currentLocation.speed_kmh || 0} km/h</p></div>`))
                    .addTo(map.current);
            } else {
                truckMarker.current.setLngLat([currentLocation.long, currentLocation.lat]);
            }
        }

        // 4. Update Directions Route (Blue Line)
        const coords = [];
        
        if (isPickedUp) {
            // Driver already picked up -> route from Truck to Destination
            if (currentLocation) {
                coords.push([currentLocation.long, currentLocation.lat]);
            }
            if (delivery.delivery_longitude && delivery.delivery_latitude) {
                coords.push([delivery.delivery_longitude, delivery.delivery_latitude]);
            }
        } else {
            // Driver heading to pickup -> route from Truck to Pickup ONLY
            if (currentLocation) {
                coords.push([currentLocation.long, currentLocation.lat]);
            }
            if (delivery.pickup_longitude && delivery.pickup_latitude) {
                coords.push([delivery.pickup_longitude, delivery.pickup_latitude]);
            }
        }

        if (coords.length > 1) {
            fetchDirections(coords);
        }
    };

    const getStatusConfig = (status) => {
        switch(status) {
            case 'pending': return { color: 'text-yellow-700', bg: 'bg-yellow-100', border: 'border-yellow-200' };
            case 'approved': return { color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-200' };
            case 'in_transit': return { color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-200' };
            case 'delivered': return { color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200' };
            case 'rejected': return { color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-200' };
            default: return { color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200' };
        }
    };

    const statusConfig = getStatusConfig(delivery.delivery_status);
    const statusText = delivery.delivery_status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const isPickedUp = delivery.delivery_status === 'in_transit' || delivery.delivery_status === 'delivered';

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden">
            <Head title={`Tracking ${delivery.waybill} - DTS Logistics`} />

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-orange-500 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                        <span className="font-medium tracking-wide">Return to Home</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-tr from-orange-600 to-orange-400 p-2 rounded-xl shadow-lg shadow-orange-500/20">
                            <Truck className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-black text-xl tracking-tight text-slate-900 hidden sm:inline-block">
                            DTS LIVE TRACKING
                        </span>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8 relative z-10">
                
                {/* Details Sidebar */}
                <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full lg:w-1/3 flex flex-col gap-6"
                >
                    {/* Main Status Card */}
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 relative overflow-hidden">
                        {/* Glow effect */}
                        <div className={`absolute -right-20 -top-20 w-40 h-40 rounded-full blur-3xl opacity-50 ${statusConfig.bg}`}></div>
                        
                        <div className="flex flex-col gap-2 mb-8 relative z-10">
                            <p className="text-sm tracking-widest text-slate-500 uppercase font-bold">Waybill Number</p>
                            <h1 className="text-4xl font-black tracking-tight text-slate-900">{delivery.waybill}</h1>
                        </div>

                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold tracking-wide uppercase text-sm ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border} mb-8 relative z-10`}>
                            <div className={`w-2 h-2 rounded-full ${statusConfig.color.replace('text-', 'bg-')} ${delivery.delivery_status === 'in_transit' ? 'animate-pulse' : ''}`}></div>
                            {statusText}
                        </div>

                        <div className="space-y-8 relative z-10">
                            <div className="relative">
                                {/* Route Line */}
                                <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-slate-200"></div>

                                {/* Pickup (Hide if picked up) */}
                                {!isPickedUp && (
                                    <div className="flex gap-6 relative z-10 mb-8">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border-2 border-blue-500 shadow-md">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        </div>
                                        <div className="pt-1">
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Origin</p>
                                            <p className="font-medium text-slate-800 leading-snug">{delivery.pickup_address || 'Not specified'}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Destination */}
                                <div className="flex gap-6 relative z-10">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border-2 border-emerald-500 shadow-md">
                                        <MapPin className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div className="pt-1">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Destination</p>
                                        <p className="font-medium text-slate-800 leading-snug">{delivery.delivery_address || 'Not specified'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                                <Package className="w-4 h-4 text-orange-500" /> Item
                            </p>
                            <p className="font-bold text-slate-800 truncate">{delivery.item_description}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-orange-500" /> ETA
                            </p>
                            <p className="font-bold text-slate-800">
                                {delivery.estimated_delivery_time ? new Date(delivery.estimated_delivery_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Pending'}
                            </p>
                        </div>
                    </div>

                    {/* Live Tracker Panel */}
                    <AnimatePresence>
                        {currentLocation && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl shadow-lg shadow-orange-500/20 p-6 relative overflow-hidden"
                            >
                                <div className="absolute right-0 top-0 bottom-0 w-32 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none"></div>
                                <div className="relative z-10 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                                            <h3 className="text-orange-100 text-xs font-bold uppercase tracking-widest">Live Telemetry</h3>
                                        </div>
                                        <p className="text-2xl font-black text-white">{isPickedUp ? 'In Transit' : 'Heading to Pickup'}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2">
                                            <Activity className="w-5 h-5 text-orange-200" />
                                            <span className="font-bold text-white text-lg">{currentLocation.speed_kmh} <span className="text-sm font-medium text-orange-200">km/h</span></span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Map Area */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="w-full lg:w-2/3 h-[600px] lg:h-auto rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white relative group"
                >
                    <div ref={mapContainer} className="w-full h-full" />

                    {!mapLoaded && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md z-30">
                            <div className="relative">
                                <Map className="w-12 h-12 text-slate-300 mb-4" />
                                <div className="absolute inset-0 border-4 border-t-orange-500 border-r-orange-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                            </div>
                            <p className="text-orange-500 font-medium tracking-widest uppercase text-sm mt-4 animate-pulse">Initializing Mapbox...</p>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
