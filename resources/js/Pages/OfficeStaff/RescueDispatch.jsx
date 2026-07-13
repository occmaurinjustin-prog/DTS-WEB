import React, { useState, useEffect, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import OfficeStaffLayout from '../../Layouts/OfficeStaffLayout';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AlertCircle, MapPin, Wrench, Clock, Search, XCircle, CheckCircle } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import usePagination from '@/hooks/usePagination';

if (mapboxgl) {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
}

export default function RescueDispatch({ authUser, activeRescues, rescueHistory, mechanics, inventory = [] }) {
    const [selectedRescue, setSelectedRescue] = useState(null);
    const { paginatedData, currentPage, setCurrentPage, totalPages } = usePagination(activeRescues, 10);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedMechanicId, setSelectedMechanicId] = useState('');
    const [dispatchNotes, setDispatchNotes] = useState('');
    
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markers = useRef({});
    
    const { flash } = usePage().props;

    // Real-time WebSockets
    useEffect(() => {
        if (!window.Echo) return;

        const channel = window.Echo.channel('rescues')
            .listen('RescueRequestSubmitted', (e) => {
                console.log('Rescue request submitted via WebSocket', e);
                router.reload({ 
                    only: ['activeRescues'], 
                    preserveScroll: true, 
                    preserveState: true 
                });
            });

        return () => {
            if (window.Echo) window.Echo.leaveChannel('rescues');
        };
    }, []);

    // Initialize Map
    useEffect(() => {
        if (!mapContainer.current || map.current || !mapboxgl) return;

        try {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/outdoors-v12',
                center: [120.9842, 14.5995], // Manila
                zoom: 11
            });

            map.current.addControl(new mapboxgl.NavigationControl());

            map.current.on('load', () => {
                setMapLoaded(true);
            });
        } catch (error) {
            console.error('Failed to init mapbox', error);
        }

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    // Draw markers
    useEffect(() => {
        if (!mapLoaded || !map.current) return;

        // Clear existing markers
        Object.values(markers.current).forEach(markerObj => {
            if (markerObj.driver) markerObj.driver.remove();
            if (markerObj.mechanic) markerObj.mechanic.remove();
        });
        markers.current = {};

        const bounds = new mapboxgl.LngLatBounds();
        let hasPoints = false;

        const rescuesToShow = selectedRescue ? [selectedRescue] : activeRescues;
        const currentRouteIds = new Set();

        const getRoute = async (mapInstance, start, end, id) => {
            try {
                const query = await fetch(
                    `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
                );
                const json = await query.json();
                if (!json.routes || json.routes.length === 0) return;
                const route = json.routes[0].geometry.coordinates;
                
                const geojson = {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: route
                    }
                };
                
                if (mapInstance.getSource(`route-${id}`)) {
                    mapInstance.getSource(`route-${id}`).setData(geojson);
                } else {
                    mapInstance.addLayer({
                        id: `route-${id}`,
                        type: 'line',
                        source: {
                            type: 'geojson',
                            data: geojson
                        },
                        layout: {
                            'line-join': 'round',
                            'line-cap': 'round'
                        },
                        paint: {
                            'line-color': '#3b82f6', // blue-500
                            'line-width': 5,
                            'line-opacity': 0.75
                        }
                    });
                }
            } catch (error) {
                console.error('Error fetching route:', error);
            }
        };

        rescuesToShow.forEach(rescue => {
            if (!rescue.latitude || !rescue.longitude) return;

            // Driver Marker
            const driverEl = document.createElement('div');
            driverEl.className = 'w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-pulse';
            driverEl.innerHTML = '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>';
            
            const driverMarker = new mapboxgl.Marker({ element: driverEl, anchor: 'center' })
                .setLngLat([rescue.longitude, rescue.latitude])
                .addTo(map.current);
            
            bounds.extend([rescue.longitude, rescue.latitude]);
            hasPoints = true;

            // Mechanic Marker (if en_route or arrived and has coords)
            let mechanicMarker = null;
            if (rescue.mechanic_latitude && rescue.mechanic_longitude) {
                const mechEl = document.createElement('div');
                mechEl.className = 'w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg';
                mechEl.innerHTML = '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>';
                
                mechanicMarker = new mapboxgl.Marker({ element: mechEl, anchor: 'center' })
                    .setLngLat([rescue.mechanic_longitude, rescue.mechanic_latitude])
                    .addTo(map.current);
                
                bounds.extend([rescue.mechanic_longitude, rescue.mechanic_latitude]);
                
                // Draw route between mechanic and driver
                getRoute(map.current, [rescue.mechanic_longitude, rescue.mechanic_latitude], [rescue.longitude, rescue.latitude], rescue.rescue_id);
                currentRouteIds.add(`route-${rescue.rescue_id}`);
            }

            markers.current[rescue.rescue_id] = { driver: driverMarker, mechanic: mechanicMarker };
        });

        // Cleanup old route layers
        if (map.current.getStyle() && map.current.getStyle().layers) {
            map.current.getStyle().layers.forEach(layer => {
                if (layer.id.startsWith('route-') && !currentRouteIds.has(layer.id)) {
                    map.current.removeLayer(layer.id);
                    map.current.removeSource(layer.id);
                }
            });
        }

        if (hasPoints) {
            map.current.fitBounds(bounds, { padding: 80, maxZoom: 14 });
        }
    }, [mapLoaded, activeRescues, selectedRescue]);

    const handleAssignSubmit = (e) => {
        e.preventDefault();
        if (!selectedRescue || !selectedMechanicId) return;

        router.post(`/office-staff/rescue-dispatch/${selectedRescue.rescue_id}/assign`, {
            mechanic_id: selectedMechanicId,
            notes: dispatchNotes
        }, {
            onSuccess: () => {
                setShowAssignModal(false);
                setSelectedMechanicId('');
                setDispatchNotes('');
            }
        });
    };

    return (
        <OfficeStaffLayout title="Rescue Dispatch" authUser={authUser} activeMenu="rescue">
            <div className="flex h-[calc(100vh-theme(spacing.16))] lg:h-screen bg-white">
                {/* Left Panel - List */}
                <div className="w-full lg:w-[400px] bg-white border-r border-zinc-200 flex flex-col z-10 shrink-0">
                    <div className="p-6 border-b border-zinc-200 bg-white">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 border border-zinc-200 text-zinc-900 flex items-center justify-center shrink-0">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <h1 className="text-xl lg:text-2xl font-bold text-zinc-900 tracking-tight leading-none">Rescue Dispatch</h1>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">Manage driver emergencies</p>
                            <button
                                onClick={() => router.get('/office-staff/rescue-history')}
                                className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-[10px] uppercase tracking-widest font-bold transition-colors"
                            >
                                <Clock className="w-3.5 h-3.5" />
                                History
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50">
                        <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Active Emergencies ({activeRescues.length})</h2>
                        
                        {paginatedData.map(rescue => (
                            <div 
                                key={rescue.rescue_id}
                                onClick={() => setSelectedRescue(rescue === selectedRescue ? null : rescue)}
                                className={`p-5 cursor-pointer transition-all border ${
                                    selectedRescue?.rescue_id === rescue.rescue_id 
                                        ? 'bg-zinc-100 border-zinc-300' 
                                        : 'bg-white border-zinc-200 hover:border-zinc-300'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${
                                            rescue.status === 'pending' ? 'bg-red-500 animate-pulse' :
                                            rescue.status === 'assigned' ? 'bg-amber-500' :
                                            'bg-emerald-500'
                                        }`} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                            {rescue.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                                        {new Date(rescue.created_at).toLocaleTimeString()}
                                    </span>
                                </div>

                                <h3 className="font-bold text-zinc-900 mb-1">{rescue.issue_category}</h3>
                                <p className="text-sm text-zinc-600 font-medium mb-4 line-clamp-2">{rescue.description}</p>
                                
                                {rescue.media && rescue.media.length > 0 && (
                                    <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                                        {rescue.media.map((media, index) => (
                                            <a 
                                                key={media.media_id || index} 
                                                href={`/storage/${media.file_path}`} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="shrink-0 block border border-zinc-200 hover:opacity-80 transition"
                                            >
                                                <img 
                                                    src={`/storage/${media.file_path}`} 
                                                    className="h-16 w-16 object-cover"
                                                    alt="Rescue Attachment"
                                                />
                                            </a>
                                        ))}
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-2 text-xs text-zinc-600 bg-zinc-50 border border-zinc-200 p-2 mb-4">
                                    <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
                                    <span className="truncate">{rescue.address || 'Location provided via GPS'}</span>
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-200">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 border border-zinc-200 bg-white flex items-center justify-center text-[10px] font-bold text-zinc-600">
                                            {rescue.driver?.user?.firstname?.charAt(0) || 'D'}
                                        </div>
                                        <span className="text-xs font-semibold text-zinc-700">
                                            {rescue.driver?.user ? `${rescue.driver.user.firstname} ${rescue.driver.user.lastname}` : 'Driver'}
                                        </span>
                                    </div>
                                    
                                    {rescue.status === 'pending' ? (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedRescue(rescue);
                                                setShowAssignModal(true);
                                            }}
                                            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] uppercase tracking-widest font-bold transition-colors"
                                        >
                                            Dispatch
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-zinc-700 bg-zinc-100 border border-zinc-200 px-2.5 py-1">
                                                <Wrench className="w-3.5 h-3.5" />
                                                {rescue.mechanic?.username}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {activeRescues.length === 0 && (
                            <div className="text-center py-12">
                                <CheckCircle className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                                <h3 className="text-sm font-bold text-zinc-900">All clear</h3>
                                <p className="text-xs font-medium uppercase tracking-widest text-zinc-500 mt-1">No active rescue requests</p>
                            </div>
                        )}
                        
                        {activeRescues.length > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                totalItems={activeRescues.length}
                                itemsPerPage={10}
                            />
                        )}
                    </div>
                </div>

                {/* Right Panel - Map */}
                <div className="flex-1 relative bg-zinc-100">
                    <div ref={mapContainer} className="absolute inset-0" style={{ width: '100%', height: '100%' }} />
                </div>
            </div>

            {/* Assign Modal */}
            {showAssignModal && selectedRescue && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setShowAssignModal(false)} />
                    <div className="relative bg-white border border-zinc-200 shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-zinc-200">
                            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Dispatch Mechanic & Parts</h2>
                        </div>
                        
                        <form onSubmit={handleAssignSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50">
                            <div>
                                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Select Mechanic</label>
                                <select 
                                    className="w-full bg-white border border-zinc-200 text-zinc-900 text-sm focus:ring-0 focus:border-zinc-500 block p-3"
                                    value={selectedMechanicId}
                                    onChange={e => setSelectedMechanicId(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Choose an available mechanic...</option>
                                    {mechanics.map(m => (
                                        <option key={m.user_id} value={m.user_id}>
                                            {m.firstname} {m.lastname}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Dispatch Notes (Optional)</label>
                                <textarea
                                    className="w-full bg-white border border-zinc-200 text-zinc-900 text-sm focus:ring-0 focus:border-zinc-500 block p-3"
                                    rows="3"
                                    placeholder="E.g., Bring spare tire and jack..."
                                    value={dispatchNotes}
                                    onChange={e => setDispatchNotes(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-zinc-200">
                                <button
                                    type="button"
                                    onClick={() => setShowAssignModal(false)}
                                    className="px-5 py-2.5 text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors text-xs font-semibold uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!selectedMechanicId}
                                    className="px-5 py-2.5 text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors text-xs font-bold uppercase tracking-widest"
                                >
                                    Confirm Dispatch
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </OfficeStaffLayout>
    );
}
