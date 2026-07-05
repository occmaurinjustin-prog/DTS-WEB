import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
    Truck, MapPin, Navigation, Clock, Package,
    CheckCircle2, ChevronLeft, ArrowRight, ShieldCheck,
    Activity, Map, Search, Phone, FileText, User, Calendar, X,
    ChevronDown, ChevronUp
} from 'lucide-react';

export default function Tracking({ delivery, currentLocation: initialLocation }) {
    const [liveLocation, setLiveLocation] = useState(initialLocation);
    const mapContainer = useRef(null);
    const map = useRef(null);
    const hasInitialView = useRef(false);
    const truckMarker = useRef(null);
    const pickupMarker = useRef(null);
    const deliveryMarker = useRef(null);
    const routeSourceId = 'route';
    const [mapLoaded, setMapLoaded] = useState(false);
    
    // For search mode
    const [searchWaybill, setSearchWaybill] = useState('');
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);

    // For mobile panel
    const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
    const { flash } = usePage().props;

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchWaybill.trim()) {
            setIsLoadingSearch(true);
            router.get(`/track/${searchWaybill.trim()}`, {}, {
                onFinish: () => setIsLoadingSearch(false)
            });
        }
    };

    // Sync initial location when props change
    useEffect(() => {
        setLiveLocation(initialLocation);
    }, [initialLocation]);

    // Real-time WebSocket updates instead of polling
    useEffect(() => {
        if (!delivery || !delivery.driver_id || !window.Echo) return;

        const channel = window.Echo.channel('drivers')
            .listen('DriverLocationUpdated', (e) => {
                if (e.id === delivery.driver_id) {
                    setLiveLocation({ lat: e.lat, long: e.lng, speed_kmh: e.speed });
                }
            });

        return () => {
            if (window.Echo) window.Echo.leaveChannel('drivers');
        };
    }, [delivery]);

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

    // 1. Initialize Map ONCE
    useEffect(() => {
        if (!mapContainer.current) return;

        if (!map.current) {
            mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

            let startLng = 121.0503; // Default to Manila
            let startLat = 14.5823;

            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [startLng, startLat],
                zoom: 11,
                pitch: 0,
                bearing: 0,
            });

            map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

            map.current.on('load', () => {
                map.current.resize();
                
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
                        'line-color': '#2563EB', // Blue-600
                        'line-width': 5,
                        'line-opacity': 0.9,
                    }
                });
                
                setMapLoaded(true);
            });
        }

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
                setMapLoaded(false);
            }
        };
    }, []); // EMPTY DEPENDENCY ARRAY - ONLY RUN ONCE!

    // 2. Update Map Data when delivery or liveLocation changes
    useEffect(() => {
        if (mapLoaded && delivery) {
            updateMapData();
            map.current.resize();
        }
    }, [liveLocation, delivery, mapLoaded]);

    const updateMapData = () => {
        if (!map.current || !mapLoaded || !delivery) return;

        const isPickedUp = delivery.delivery_status === 'in_transit' || delivery.delivery_status === 'delivered';

        // 1. Manage Pickup Marker (Hide if already picked up)
        if (!isPickedUp && delivery.pickup_longitude && delivery.pickup_latitude) {
            if (!pickupMarker.current) {
                const pickupEl = document.createElement('div');
                pickupEl.className = 'w-8 h-8 bg-white rounded-full border-[3px] border-slate-300 shadow-md flex items-center justify-center text-slate-600';
                pickupEl.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>';

                pickupMarker.current = new mapboxgl.Marker(pickupEl)
                    .setLngLat([delivery.pickup_longitude, delivery.pickup_latitude])
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
                deliveryEl.className = 'w-10 h-10 bg-blue-600 rounded-full border-[3px] border-white shadow-xl flex items-center justify-center text-white';
                deliveryEl.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';

                deliveryMarker.current = new mapboxgl.Marker(deliveryEl)
                    .setLngLat([delivery.delivery_longitude, delivery.delivery_latitude])
                    .addTo(map.current);
            }
        }

        // 3. Manage Truck Marker - SAFE COORDINATE CHECK
        if (liveLocation && Number.isFinite(liveLocation.long) && Number.isFinite(liveLocation.lat)) {
            if (!truckMarker.current) {
                const truckEl = document.createElement('div');
                truckEl.className = 'w-12 h-12 bg-slate-900 rounded-2xl shadow-lg border-[3px] border-blue-500 flex items-center justify-center text-white';

                truckEl.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>';

                truckMarker.current = new mapboxgl.Marker({ element: truckEl, anchor: 'center' })
                    .setLngLat([liveLocation.long, liveLocation.lat])
                    .addTo(map.current);
            } else {
                truckMarker.current.setLngLat([liveLocation.long, liveLocation.lat]);
            }
        }

        // 4. Update Directions Route (Blue Line)
        const coords = [];

        if (isPickedUp) {
            if (liveLocation && Number.isFinite(liveLocation.long) && Number.isFinite(liveLocation.lat)) {
                coords.push([liveLocation.long, liveLocation.lat]);
            }
            if (delivery.delivery_longitude && delivery.delivery_latitude) {
                coords.push([delivery.delivery_longitude, delivery.delivery_latitude]);
            }
        } else {
            if (liveLocation && Number.isFinite(liveLocation.long) && Number.isFinite(liveLocation.lat)) {
                coords.push([liveLocation.long, liveLocation.lat]);
            }
            if (delivery.pickup_longitude && delivery.pickup_latitude) {
                coords.push([delivery.pickup_longitude, delivery.pickup_latitude]);
            }
        }

        if (!hasInitialView.current) {
            if (coords.length > 1) {
                fetchDirections(coords);
                
                // Fly to fit the route bounds
                const bounds = new mapboxgl.LngLatBounds();
                coords.forEach(c => bounds.extend(c));
                map.current.fitBounds(bounds, { padding: 100, pitch: 45, maxZoom: 15 });
            } else if (coords.length === 1) {
                map.current.flyTo({ center: coords[0], zoom: 14, pitch: 45 });
            }
            hasInitialView.current = true;
        } else {
            // If already initialized, just update directions quietly
            if (coords.length > 1) {
                fetchDirections(coords);
            }
        }
    };

    const timelineSteps = [
        { id: 'pending', label: 'Order Placed', desc: 'Awaiting confirmation' },
        { id: 'approved', label: 'Processing', desc: 'Driver is being dispatched' },
        { id: 'in_transit', label: 'In Transit', desc: 'Package is on the way' },
        { id: 'delivered', label: 'Delivered', desc: 'Package arrived safely' }
    ];

    const currentStepIndex = delivery ? (timelineSteps.findIndex(s => s.id === delivery.delivery_status) === -1
        ? (delivery.delivery_status === 'rejected' ? 0 : 0)
        : timelineSteps.findIndex(s => s.id === delivery.delivery_status)) : 0;

    const isPickedUp = delivery ? (delivery.delivery_status === 'in_transit' || delivery.delivery_status === 'delivered') : false;

    return (
        <div className="h-screen w-screen overflow-hidden bg-slate-900 font-sans text-slate-800 relative">
            <Head title={delivery ? `Tracking ${delivery.waybill} - DTS Logistics` : `Track Delivery - DTS Logistics`} />

            {/* FULL SCREEN MAP (Rendered Once) */}
            <div ref={mapContainer} className={`absolute inset-0 w-full h-full z-0 ${!delivery ? 'opacity-40 grayscale' : ''}`} />
            
            {/* Search Mode Map Overlay */}
            {!delivery && (
                <div className="absolute inset-0 bg-slate-900/60 z-0 backdrop-blur-sm" />
            )}

            {!mapLoaded && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-6"></div>
                        <p className="text-slate-400 font-bold tracking-widest text-sm uppercase">Initializing Map...</p>
                    </div>
                </div>
            )}

            {/* ERROR FLASH */}
            <AnimatePresence>
                {flash?.error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4"
                    >
                        <div className="bg-red-50 text-red-600 px-5 py-4 rounded-2xl shadow-2xl border border-red-200 flex items-center gap-3">
                            <X className="w-6 h-6 shrink-0" />
                            <span className="font-semibold">{flash.error}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* OVERLAYS */}
            {!delivery ? (
                // --- SEARCH MODE OVERLAY ---
                <>
                    <div className="absolute top-6 left-6 z-40">
                        <Link href="/" className="px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full shadow-lg border border-white/20 text-white font-semibold hover:bg-white hover:text-slate-900 transition-all flex items-center gap-2 group">
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Home
                        </Link>
                    </div>

                    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-xl px-4 pointer-events-auto"
                        >
                            <div className="bg-white/95 backdrop-blur-2xl p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border border-white">
                                <div className="flex justify-center mb-8">
                                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center border-8 border-blue-100">
                                        <Map className="w-8 h-8 text-blue-600" />
                                    </div>
                                </div>
                                <div className="text-center mb-10">
                                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-3">Track Delivery</h1>
                                    <p className="text-slate-500 font-medium text-lg">Enter your waybill number to track your package in real-time.</p>
                                </div>
                                <form onSubmit={handleSearch} className="relative group flex flex-col gap-4">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="e.g. DTS-123456789"
                                            value={searchWaybill}
                                            onChange={(e) => setSearchWaybill(e.target.value)}
                                            className="w-full bg-slate-50 border-2 border-slate-200 pl-14 pr-6 py-5 rounded-2xl text-slate-900 font-bold text-lg placeholder-slate-400 focus:ring-4 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all outline-none uppercase"
                                            required
                                        />
                                        <Search className="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={isLoadingSearch}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-5 rounded-2xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isLoadingSearch ? (
                                            <>
                                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Searching...
                                            </>
                                        ) : (
                                            <>
                                                Track Package <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </>
            ) : (
                // --- TRACKING MODE OVERLAY ---
                <>
                    {/* HEADER FOR BACK BUTTON (Floating Top Right) */}
                    <div className="absolute top-6 right-6 z-40 hidden md:block">
                        <Link href="/" className="px-5 py-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-white/50 text-slate-700 font-semibold hover:bg-white hover:shadow-xl transition-all flex items-center gap-2 group">
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Home
                        </Link>
                    </div>

                    {/* FLOATING GLASS SIDEBAR (Desktop) / BOTTOM SHEET (Mobile) */}
                    <div className={`
                        absolute z-30 transition-all duration-500 ease-in-out flex flex-col
                        md:top-6 md:left-6 md:w-[420px] md:bottom-6 md:translate-y-0
                        w-full left-0 bottom-0 bg-white/95 md:bg-white/90 backdrop-blur-xl md:rounded-[2rem] rounded-t-[2rem] shadow-2xl md:border md:border-white/50 overflow-hidden
                        ${isMobilePanelOpen ? 'h-[85vh]' : 'h-[30vh] md:h-auto'}
                    `}>
                        
                        {/* Mobile Drag Handle */}
                        <div 
                            className="w-full flex justify-center py-4 md:hidden cursor-pointer bg-transparent"
                            onClick={() => setIsMobilePanelOpen(!isMobilePanelOpen)}
                        >
                            <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 pb-8 md:pt-8 custom-scrollbar">
                            
                            {/* Header / Waybill Search */}
                            <div className="mb-8">
                                <form onSubmit={handleSearch} className="relative group">
                                    <input
                                        type="text"
                                        placeholder="Track another waybill..."
                                        value={searchWaybill}
                                        onChange={(e) => setSearchWaybill(e.target.value)}
                                        className="w-full bg-slate-100/50 border border-slate-200 pl-11 pr-4 py-3.5 rounded-2xl text-slate-800 font-medium placeholder-slate-400 focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 focus:bg-white transition-all outline-none"
                                    />
                                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                    <button type="submit" className="hidden"></button>
                                </form>
                            </div>

                            <div className="mb-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-blue-600 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
                                    <Activity className="w-3.5 h-3.5" /> Live Tracking
                                </div>
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2 drop-shadow-sm">
                                    #{delivery.waybill}
                                </h1>
                                <p className="text-slate-500 text-sm font-medium">Auto-updating in real-time</p>
                            </div>

                            {/* Telemetry (Speed) */}
                            <AnimatePresence>
                                {liveLocation && isPickedUp && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mb-8"
                                    >
                                        <div className="bg-slate-900 text-white rounded-[1.5rem] p-6 relative overflow-hidden shadow-[0_15px_30px_-10px_rgba(0,0,0,0.3)] border border-slate-700">
                                            <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-600 rounded-full blur-3xl opacity-30"></div>
                                            <div className="flex items-center justify-between relative z-10">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                        <span className="relative flex h-2 w-2">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                        </span>
                                                        Live Telemetry
                                                    </p>
                                                    <div className="text-slate-300 text-sm font-medium">Vehicle Speed</div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-5xl font-black font-mono leading-none tracking-tighter text-white drop-shadow-md">
                                                        {liveLocation.speed_kmh} <span className="text-lg font-medium text-slate-400 tracking-normal ml-0.5">km/h</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Locations */}
                            <div className="mb-10 bg-white/50 border border-slate-200/60 rounded-3xl p-6 relative shadow-sm backdrop-blur-sm">
                                <div className="absolute left-[31px] top-10 bottom-10 w-[3px] bg-slate-200 rounded-full"></div>

                                <div className="relative mb-7">
                                    <div className="absolute -left-1.5 top-0.5 w-8 h-8 rounded-full bg-white flex items-center justify-center border-4 border-slate-50 shadow-sm z-10">
                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
                                    </div>
                                    <div className="pl-12">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Origin Location</p>
                                        <p className="font-semibold text-slate-800 text-sm leading-snug">{delivery.pickup_address || 'Not specified'}</p>
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="absolute -left-1.5 top-0.5 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border-4 border-slate-50 shadow-sm z-10">
                                        <MapPin className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="pl-12">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Destination Address</p>
                                        <p className="font-semibold text-slate-800 text-sm leading-snug">{delivery.delivery_address || 'Not specified'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="mb-10">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 px-1">Delivery Journey</h3>
                                <div className="relative pl-4 space-y-7">
                                    <div className="absolute left-[27px] top-3 bottom-3 w-[3px] bg-slate-100 rounded-full"></div>
                                    {timelineSteps.map((step, idx) => {
                                        const isCompleted = idx < currentStepIndex;
                                        const isCurrent = idx === currentStepIndex;
                                        
                                        return (
                                            <div key={step.id} className="relative flex gap-5 items-start">
                                                <div className="relative z-10 bg-transparent pt-1 pb-1">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                                        isCompleted ? 'bg-blue-600 border-2 border-blue-600 shadow-md' :
                                                        isCurrent ? 'bg-white border-[3px] border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)] ring-4 ring-blue-50' :
                                                        'bg-white border-2 border-slate-200'
                                                    }`}>
                                                        {isCompleted ? (
                                                            <CheckCircle2 className="w-5 h-5 text-white" />
                                                        ) : isCurrent ? (
                                                            <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
                                                        ) : null}
                                                    </div>
                                                </div>
                                                <div className={`flex-1 pt-1.5 ${isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>
                                                    <h4 className="font-bold text-[15px] leading-none mb-1.5">{step.label}</h4>
                                                    <p className={`text-xs font-medium ${isCurrent ? 'text-slate-500' : 'text-slate-400'}`}>{step.desc}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Driver Profile */}
                            <div className="pb-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">Assigned Team</h3>
                                {delivery.driver ? (
                                    <div className="flex items-center gap-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all">
                                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm shrink-0 relative">
                                            <User className="w-7 h-7 text-slate-500" />
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                                                <CheckCircle2 className="w-3 h-3 text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-900 text-base">{delivery.driver.user?.firstname} {delivery.driver.user?.lastname}</h4>
                                            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mt-1">
                                                <Truck className="w-3.5 h-3.5 text-slate-400" />
                                                {delivery.driver.truck?.plate_number || 'Vehicle Assigned'}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-5">
                                        <div className="w-14 h-14 rounded-full bg-slate-200/50 flex items-center justify-center shrink-0">
                                            <User className="w-7 h-7 text-slate-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-600 text-sm">Assigning Driver...</h4>
                                            <p className="text-xs font-medium text-slate-400 mt-0.5">Please check back shortly</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Footer Gradient Overlay */}
                    <div className="md:hidden absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent pointer-events-none z-30"></div>
                </>
            )}
        </div>
    );
}
