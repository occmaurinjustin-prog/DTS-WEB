import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
    Truck, MapPin, Navigation, Clock, Package, 
    CheckCircle2, ChevronLeft, ArrowRight, ShieldCheck,
    Activity, Map, Search, Phone, FileText, User, Calendar, X
} from 'lucide-react';

export default function Tracking({ delivery, currentLocation }) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const truckMarker = useRef(null);
    const pickupMarker = useRef(null);
    const deliveryMarker = useRef(null);
    const routeSourceId = 'route';
    const [mapLoaded, setMapLoaded] = useState(false);
    const [searchWaybill, setSearchWaybill] = useState('');
    const { flash } = usePage().props;

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchWaybill.trim()) {
            router.get(`/track/${searchWaybill.trim()}`);
        }
    };

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
            case 'pending': return { color: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-500' };
            case 'approved': return { color: 'text-blue-600', bg: 'bg-blue-50', dot: 'bg-blue-500' };
            case 'in_transit': return { color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500' };
            case 'delivered': return { color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' };
            case 'rejected': return { color: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-500' };
            default: return { color: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-500' };
        }
    };

    const statusConfig = getStatusConfig(delivery.delivery_status);
    const statusText = delivery.delivery_status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const isPickedUp = delivery.delivery_status === 'in_transit' || delivery.delivery_status === 'delivered';

    const timelineSteps = [
        { id: 'pending', label: 'Order Placed' },
        { id: 'approved', label: 'Processing' },
        { id: 'in_transit', label: 'In Transit' },
        { id: 'delivered', label: 'Delivered' }
    ];

    const currentStepIndex = timelineSteps.findIndex(s => s.id === delivery.delivery_status) === -1 
        ? (delivery.delivery_status === 'rejected' ? 0 : 0)
        : timelineSteps.findIndex(s => s.id === delivery.delivery_status);

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800">
            <Head title={`Tracking ${delivery.waybill} - DTS Logistics`} />

            {/* Premium Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium">
                        <ChevronLeft className="w-4 h-4" />
                        <span>Home</span>
                    </Link>
                    
                    {/* Search Field inside Header */}
                    <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full mx-4">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Enter waybill number..."
                                value={searchWaybill}
                                onChange={(e) => setSearchWaybill(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                        >
                            Track
                        </button>
                    </form>

                    <div className="flex items-center gap-2 hidden sm:flex">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <span className="font-semibold text-sm tracking-tight text-slate-900 uppercase">
                            Secure Tracking
                        </span>
                    </div>
                </div>
            </header>

            {/* Flash Error Banner */}
            <AnimatePresence>
                {flash?.error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 z-20 relative"
                    >
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm flex items-start gap-3 w-full">
                            <div className="bg-red-100 p-1.5 rounded-lg shrink-0 mt-0.5">
                                <X className="w-4 h-4 text-red-600" />
                            </div>
                            <p className="pt-1 text-sm font-semibold">{flash.error}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-6 relative z-10">
                
                {/* Details Sidebar */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full lg:w-[400px] flex flex-col gap-6 shrink-0"
                >
                    {/* Main Status Container */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-1">Waybill Number</p>
                                <h1 className="text-2xl font-black tracking-tight text-slate-900 font-mono">{delivery.waybill}</h1>
                            </div>
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide ${statusConfig.bg} ${statusConfig.color} border border-slate-100`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} ${delivery.delivery_status === 'in_transit' ? 'animate-pulse' : ''}`}></div>
                                {statusText}
                            </div>
                        </div>

                        {/* Delivery Timeline */}
                        <div className="mb-8 mt-2">
                            <div className="relative flex justify-between">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-slate-100"></div>
                                <div 
                                    className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-blue-600 transition-all duration-1000 ease-out" 
                                    style={{ width: `${(currentStepIndex / (timelineSteps.length - 1)) * 100}%` }}
                                ></div>
                                
                                {timelineSteps.map((step, index) => {
                                    const isCompleted = index <= currentStepIndex;
                                    const isCurrent = index === currentStepIndex;
                                    return (
                                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                                            <div className={`w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center transition-colors duration-500 ${isCompleted ? 'border-blue-600' : 'border-slate-200'}`}>
                                                {isCompleted && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>}
                                            </div>
                                            <p className={`absolute top-6 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${isCurrent ? 'text-blue-600' : (isCompleted ? 'text-slate-600' : 'text-slate-400')}`}>
                                                {step.label}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Route Info */}
                        <div className="space-y-6 relative mt-12">
                            <div className="relative pl-6">
                                {/* Vertical Line */}
                                <div className="absolute left-[9px] top-4 bottom-4 w-[2px] bg-slate-100"></div>

                                {/* Pickup */}
                                <div className="relative mb-6">
                                    <div className="absolute -left-[29px] top-0 w-5 h-5 rounded-full bg-slate-50 border-2 border-slate-300 flex items-center justify-center z-10">
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Origin</p>
                                    <p className="text-sm font-medium text-slate-800">{delivery.pickup_address || 'Not specified'}</p>
                                </div>

                                {/* Destination */}
                                <div className="relative">
                                    <div className="absolute -left-[29px] top-0 w-5 h-5 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center z-10 shadow-sm">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Destination</p>
                                    <p className="text-sm font-medium text-slate-800">{delivery.delivery_address || 'Not specified'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                                <Package className="w-3.5 h-3.5 text-slate-600" /> Item
                            </p>
                            <p className="text-sm font-semibold text-slate-800 truncate">{delivery.item_description}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-600" /> ETA
                            </p>
                            <p className="text-sm font-semibold text-slate-800">
                                {delivery.estimated_delivery_time ? new Date(delivery.estimated_delivery_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending'}
                            </p>
                        </div>
                    </div>

                    {/* Driver Information (If Available) */}
                    {delivery.driver && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Driver Information</p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                                    <User className="w-6 h-6 text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{delivery.driver.user?.firstname} {delivery.driver.user?.lastname}</p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                        <Truck className="w-3 h-3" /> {delivery.driver.truck?.plate_number || 'Vehicle Assigned'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm text-sm font-semibold text-slate-700">
                            <FileText className="w-4 h-4" />
                            Receipt
                        </button>
                        <button className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 border border-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-sm text-sm font-semibold text-white">
                            <Phone className="w-4 h-4" />
                            Support
                        </button>
                    </div>

                    {/* Live Tracker Panel - Refined */}
                    <AnimatePresence>
                        {currentLocation && isPickedUp && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-900 rounded-xl shadow-md border border-slate-800 p-5 relative overflow-hidden"
                            >
                                <div className="relative z-10 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex h-3 w-3">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-0.5">Telemetry</p>
                                            <p className="text-sm font-bold text-white">Live Connection</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-black text-white font-mono">{currentLocation.speed_kmh} <span className="text-xs font-medium text-slate-400">km/h</span></p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Map Area */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full lg:flex-1 h-[500px] lg:h-auto rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-slate-100 relative"
                >
                    <div ref={mapContainer} className="w-full h-full" />

                    {!mapLoaded && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm z-30">
                            <Activity className="w-8 h-8 text-blue-500 animate-pulse mb-3" />
                            <p className="text-slate-600 font-semibold text-sm">Initializing Tracking Map...</p>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
