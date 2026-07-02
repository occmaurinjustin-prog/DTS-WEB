import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import OfficeStaffLayout from '@/Layouts/OfficeStaffLayout';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
    Truck, MapPin, Wrench, AlertTriangle, ShieldCheck, 
    User, Phone, CheckCircle2, Clock, Video, Image, 
    Filter, RefreshCw, Navigation, X, ShieldAlert
} from 'lucide-react';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function RescueDashboard({ rescueRequests, mechanics, filters }) {
    const { flash } = usePage().props;
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [assigningRequest, setAssigningRequest] = useState(null);
    const [selectedMechanicId, setSelectedMechanicId] = useState('');
    const [etaMinutes, setEtaMinutes] = useState('30');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [severityFilter, setSeverityFilter] = useState(filters.severity || 'all');
    const [isLoading, setIsLoading] = useState(false);

    // Mapbox refs
    const mapContainer = useRef(null);
    const map = useRef(null);
    const activeMarkers = useRef([]);

    // Poll for real-time updates every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['rescueRequests'],
                preserveState: true,
                preserveScroll: true
            });
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    // Filter handlers
    const handleFilterChange = (type, value) => {
        const newFilters = {
            status: type === 'status' ? value : statusFilter,
            severity: type === 'severity' ? value : severityFilter
        };
        
        if (type === 'status') setStatusFilter(value);
        if (type === 'severity') setSeverityFilter(value);

        router.get('/office-staff/rescue-dashboard', newFilters, {
            preserveState: true,
            preserveScroll: true
        });
    };

    // Initialize Mapbox
    useEffect(() => {
        if (!mapContainer.current) return;

        // Initialize map centered on default location (or first request location)
        const center = [121.0564, 14.5496]; // Metro Manila default
        if (rescueRequests.length > 0) {
            const first = rescueRequests[0];
            if (first.latitude && first.longitude) {
                center[0] = parseFloat(first.longitude);
                center[1] = parseFloat(first.latitude);
            }
        }

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: center,
            zoom: 11
        });

        map.current.addControl(new mapboxgl.NavigationControl());

        return () => {
            if (map.current) map.current.remove();
        };
    }, []);

    // Update map markers when rescueRequests change
    useEffect(() => {
        if (!map.current) return;

        // Clear existing markers
        activeMarkers.current.forEach(m => m.remove());
        activeMarkers.current = [];

        rescueRequests.forEach(request => {
            if (!request.latitude || !request.longitude) return;

            // 1. Create Driver Breakdown Marker (Red pin with pulse animation)
            const driverEl = document.createElement('div');
            driverEl.className = 'relative flex items-center justify-center';
            driverEl.innerHTML = `
                <div class="absolute w-8 h-8 bg-rose-500/30 rounded-full animate-ping"></div>
                <div class="relative w-5 h-5 bg-rose-600 rounded-full border-2 border-white shadow flex items-center justify-center">
                    <span class="text-[9px] font-black text-white font-mono">B</span>
                </div>
            `;

            const driverMarker = new mapboxgl.Marker(driverEl)
                .setLngLat([parseFloat(request.longitude), parseFloat(request.latitude)])
                .setPopup(new mapboxgl.Popup({ offset: 25 })
                    .setHTML(`
                        <div class="p-2 text-slate-800 font-sans">
                            <h3 class="font-bold text-rose-600">Breakdown Reported</h3>
                            <p class="text-xs text-slate-500 font-mono mt-0.5">Waybill: ${request.waybill || 'N/A'}</p>
                            <p class="text-xs font-semibold text-slate-800 mt-1">Severity: ${request.severity.toUpperCase()}</p>
                            <p class="text-xs text-slate-600 mt-1">${request.address}</p>
                        </div>
                    `))
                .addTo(map.current);

            activeMarkers.current.push(driverMarker);

            // 2. Create Mechanic Marker (Amber pin) if assigned and location available
            if (request.mechanic && request.mechanic.current_latitude && request.mechanic.current_longitude) {
                const mechEl = document.createElement('div');
                mechEl.className = 'relative flex items-center justify-center';
                mechEl.innerHTML = `
                    <div class="absolute w-8 h-8 bg-amber-500/30 rounded-full animate-pulse"></div>
                    <div class="relative w-5 h-5 bg-amber-500 rounded-full border-2 border-white shadow flex items-center justify-center">
                        <span class="text-[9px] font-black text-white font-mono">M</span>
                    </div>
                `;

                const mechMarker = new mapboxgl.Marker(mechEl)
                    .setLngLat([parseFloat(request.mechanic.current_longitude), parseFloat(request.mechanic.current_latitude)])
                    .setPopup(new mapboxgl.Popup({ offset: 25 })
                        .setHTML(`
                            <div class="p-2 text-slate-800 font-sans">
                                <h3 class="font-bold text-amber-600">Mechanic Active</h3>
                                <p class="text-xs font-bold text-slate-800 mt-0.5">${request.mechanic.firstname} ${request.mechanic.lastname}</p>
                                <p class="text-[10px] text-slate-500 font-bold uppercase mt-1">Status: ${request.status.replace('_', ' ')}</p>
                            </div>
                        `))
                    .addTo(map.current);

                activeMarkers.current.push(mechMarker);
            }
        });
    }, [rescueRequests]);

    const focusLocation = (lat, lng) => {
        if (map.current && lat && lng) {
            map.current.flyTo({
                center: [parseFloat(lng), parseFloat(lat)],
                zoom: 14,
                essential: true
            });
        }
    };

    const handleAssignSubmit = (e) => {
        e.preventDefault();
        if (!selectedMechanicId) return;

        setIsLoading(true);
        router.post(`/office-staff/rescue/${assigningRequest.id}/assign`, {
            mechanic_id: selectedMechanicId,
            eta_minutes: etaMinutes
        }, {
            preserveState: true,
            onFinish: () => {
                setIsLoading(false);
                setAssigningRequest(null);
                setSelectedMechanicId('');
            }
        });
    };

    const getSeverityBadge = (sev) => {
        const configs = {
            low: 'bg-slate-100 text-slate-700',
            medium: 'bg-blue-50 text-blue-700 border-blue-100',
            high: 'bg-amber-50 text-amber-700 border-amber-200',
            critical: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
        };
        return configs[sev] || configs.medium;
    };

    const getStatusConfig = (status) => {
        const configs = {
            pending: { label: 'Pending Assignment', color: 'bg-rose-50 text-rose-600 border-rose-100' },
            assigned: { label: 'Assigned', color: 'bg-blue-50 text-blue-600 border-blue-100' },
            accepted: { label: 'Accepted', color: 'bg-purple-50 text-purple-600 border-purple-100' },
            on_the_way: { label: 'On The Way', color: 'bg-amber-50 text-amber-600 border-amber-100' },
            arrived: { label: 'Arrived', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
            inspection_started: { label: 'Inspecting', color: 'bg-sky-50 text-sky-600 border-sky-100' },
            repair_in_progress: { label: 'Repairing', color: 'bg-orange-50 text-orange-600 border-orange-100' },
            waiting_for_parts: { label: 'Waiting for Parts', color: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
            repair_completed: { label: 'Repair Completed', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
            cannot_repair: { label: 'Cannot Repair On-site', color: 'bg-red-50 text-red-600 border-red-100' },
            closed: { label: 'Closed (Resolved)', color: 'bg-slate-100 text-slate-600 border-slate-200' }
        };
        return configs[status] || { label: status, color: 'bg-slate-50 text-slate-600' };
    };

    return (
        <OfficeStaffLayout activeMenu="rescue" title="Rescue Assistance Dashboard">
            <Head title="Rescue Assistance Dashboard" />

            <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-slate-50 font-sans">
                
                {/* Left Side: Requests List & Details */}
                <div className="w-full lg:w-[450px] shrink-0 border-r border-slate-200 bg-white flex flex-col h-full shadow-sm">
                    {/* Header */}
                    <div className="p-5 border-b border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h1 className="text-2xl font-black tracking-tight text-slate-900">Roadside Rescue</h1>
                                <p className="text-xs text-slate-500 font-bold tracking-wide uppercase mt-0.5">Assistance Control</p>
                            </div>
                            <button 
                                onClick={() => router.reload({ only: ['rescueRequests'] })}
                                className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <select 
                                    value={statusFilter}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="assigned">Assigned</option>
                                    <option value="on_the_way">On The Way</option>
                                    <option value="repair_in_progress">Repairing</option>
                                    <option value="repair_completed">Completed</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <select 
                                    value={severityFilter}
                                    onChange={(e) => handleFilterChange('severity', e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                >
                                    <option value="all">All Severities</option>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1 select-none">
                        {rescueRequests.length === 0 ? (
                            <div className="text-center py-12">
                                <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm font-semibold text-slate-500">No rescue requests found</p>
                            </div>
                        ) : (
                            rescueRequests.map(request => (
                                <div 
                                    key={request.id}
                                    onClick={() => {
                                        setSelectedRequest(request);
                                        focusLocation(request.latitude, request.longitude);
                                    }}
                                    className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                                        selectedRequest?.id === request.id 
                                            ? 'bg-indigo-50/50 border-indigo-200' 
                                            : 'bg-white border-transparent hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="text-[10px] font-black text-slate-400 font-mono tracking-widest uppercase">Waybill</span>
                                            <h3 className="font-bold text-slate-900 font-mono mt-0.5">{request.waybill || 'N/A'}</h3>
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusConfig(request.status).color}`}>
                                            {getStatusConfig(request.status).label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 line-clamp-1 mb-2 font-medium">{request.address}</p>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-xs text-slate-700 font-semibold">{request.driver?.user?.firstname} {request.driver?.user?.lastname}</span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${getSeverityBadge(request.severity)}`}>
                                            {request.severity}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Side: Map & Actions Panel */}
                <div className="flex-1 flex flex-col h-full relative">
                    
                    {/* Interactive Map */}
                    <div ref={mapContainer} className="flex-1 w-full h-full bg-slate-100" />

                    {/* Floating Detailed Sidebar (when a request is selected) */}
                    {selectedRequest && (
                        <div className="absolute top-4 left-4 bottom-4 w-[380px] bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl flex flex-col overflow-hidden z-20 animate-in slide-in-from-left-4 duration-300">
                            
                            {/* Modal Header */}
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 tracking-wider font-mono">Waybill #{selectedRequest.waybill || 'N/A'}</p>
                                    <h2 className="text-base font-bold text-slate-900 mt-0.5">Rescue Request Details</h2>
                                </div>
                                <button 
                                    onClick={() => setSelectedRequest(null)}
                                    className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Details Content */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-5">
                                
                                {/* Status Timeline */}
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live Status</span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusConfig(selectedRequest.status).color}`}>
                                            {getStatusConfig(selectedRequest.status).label}
                                        </span>
                                    </div>
                                    
                                    {/* Visual Progress Bar */}
                                    <div className="flex items-center justify-between mt-5 mb-2 relative">
                                        {[
                                            { id: 'pending', label: 'Reported' },
                                            { id: 'assigned', label: 'Assigned' },
                                            { id: 'on_the_way', label: 'On Route' },
                                            { id: 'arrived', label: 'Arrived' },
                                            { id: 'repair_in_progress', label: 'Repairing' },
                                            { id: 'repair_completed', label: 'Completed' }
                                        ].map((step, idx, arr) => {
                                            let activeIndex = 0;
                                            const status = selectedRequest.status;
                                            if (['pending'].includes(status)) activeIndex = 0;
                                            else if (['assigned', 'accepted'].includes(status)) activeIndex = 1;
                                            else if (['on_the_way'].includes(status)) activeIndex = 2;
                                            else if (['arrived', 'inspection_started'].includes(status)) activeIndex = 3;
                                            else if (['repair_in_progress', 'waiting_for_parts'].includes(status)) activeIndex = 4;
                                            else if (['repair_completed', 'cannot_repair', 'closed'].includes(status)) activeIndex = 5;

                                            return (
                                                <div key={step.id} className="flex flex-col items-center relative z-10 flex-1">
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white ${idx <= activeIndex ? 'border-indigo-500' : 'border-slate-200'}`}>
                                                        {idx <= activeIndex && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                                                    </div>
                                                    <span className={`text-[8px] font-bold mt-1.5 uppercase text-center ${idx <= activeIndex ? 'text-indigo-600' : 'text-slate-400'}`}>{step.label}</span>
                                                    {idx < arr.length - 1 && (
                                                        <div className={`absolute top-2.5 left-[50%] right-[-50%] h-[2px] -z-10 ${idx < activeIndex ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {selectedRequest.mechanic && (
                                        <div className="flex items-center justify-between text-xs font-medium text-slate-600 mt-4 pt-3 border-t border-slate-200/50">
                                            <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-slate-400" /> {selectedRequest.mechanic.firstname} {selectedRequest.mechanic.lastname}</span>
                                            {selectedRequest.eta_minutes && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> ETA: {selectedRequest.eta_minutes} mins</span>}
                                        </div>
                                    )}
                                </div>

                                {/* Problem Details */}
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Issue Info</span>
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap gap-1">
                                            {selectedRequest.categories.map((cat, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-600 uppercase font-mono">{cat}</span>
                                            ))}
                                        </div>
                                        <p className="text-sm font-semibold text-slate-900">{selectedRequest.description}</p>
                                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 mt-2">
                                            <span className={`px-2 py-0.5 rounded ${getSeverityBadge(selectedRequest.severity)}`}>{selectedRequest.severity.toUpperCase()}</span>
                                            <span className={selectedRequest.is_drivable ? 'text-emerald-600' : 'text-rose-600'}>
                                                {selectedRequest.is_drivable ? '✓ Drivable' : '✗ Immobilized'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Vehicles Involved */}
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Truck Info</span>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-slate-700">{selectedRequest.truck?.plate_number || 'N/A'}</p>
                                            <p className="text-[10px] font-semibold text-slate-500 uppercase mt-0.5">{selectedRequest.truck?.vehicle_type || 'N/A'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Driver</p>
                                            <p className="text-xs font-bold text-slate-700">{selectedRequest.driver?.user?.firstname} {selectedRequest.driver?.user?.lastname}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Media Evidence */}
                                {selectedRequest.media && selectedRequest.media.length > 0 && (
                                    <div className="space-y-4">
                                        {/* Driver Photos */}
                                        {selectedRequest.media.filter(m => m.type === 'before').length > 0 && (
                                            <div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Driver Evidence (Before)</span>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {selectedRequest.media.filter(m => m.type === 'before').map((item, idx) => (
                                                        <a 
                                                            key={idx}
                                                            href={item.file_path} 
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center group"
                                                        >
                                                            {item.media_type === 'video' ? (
                                                                <>
                                                                    <Video className="w-6 h-6 text-slate-400 group-hover:scale-110 transition-transform" />
                                                                    <span className="absolute bottom-1 right-1 bg-black/60 px-1 rounded text-[8px] text-white font-bold uppercase font-mono">Video</span>
                                                                </>
                                                            ) : (
                                                                <img src={item.file_path} alt="Evidence" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                            )}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Mechanic Photos */}
                                        {selectedRequest.media.filter(m => m.type === 'after').length > 0 && (
                                            <div>
                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-2">Mechanic Uploads (After)</span>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {selectedRequest.media.filter(m => m.type === 'after').map((item, idx) => (
                                                        <a 
                                                            key={idx}
                                                            href={item.file_path} 
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="relative aspect-square bg-emerald-50/50 rounded-lg overflow-hidden border border-emerald-200 flex items-center justify-center group"
                                                        >
                                                            {item.media_type === 'video' ? (
                                                                <>
                                                                    <Video className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                                                                    <span className="absolute bottom-1 right-1 bg-black/60 px-1 rounded text-[8px] text-white font-bold uppercase font-mono">Video</span>
                                                                </>
                                                            ) : (
                                                                <img src={item.file_path} alt="Evidence" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                            )}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Findings if Complete */}
                                {(selectedRequest.inspection_findings || selectedRequest.repair_notes) && (
                                    <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl space-y-2">
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">Mechanic Report</span>
                                        {selectedRequest.inspection_findings && (
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase font-mono">Findings</p>
                                                <p className="text-xs text-slate-800 font-semibold">{selectedRequest.inspection_findings}</p>
                                            </div>
                                        )}
                                        {selectedRequest.repair_notes && (
                                            <div className="mt-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase font-mono">Notes</p>
                                                <p className="text-xs text-slate-800 font-semibold">{selectedRequest.repair_notes}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Assign Mechanic Panel */}
                            {selectedRequest.status === 'pending' && (
                                <div className="p-4 border-t border-slate-100 bg-white">
                                    <button 
                                        onClick={() => setAssigningRequest(selectedRequest)}
                                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
                                    >
                                        Assign Mechanic
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Assignment Dialog */}
            {assigningRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setAssigningRequest(null)} />
                    <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">Assign Mechanic</h3>
                                <p className="text-xs text-slate-400 font-semibold mt-0.5">Waybill: {assigningRequest.waybill}</p>
                            </div>
                            <button onClick={() => setAssigningRequest(null)} className="p-1 text-slate-400 hover:text-slate-800">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAssignSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Select Mechanic</label>
                                <select 
                                    required
                                    value={selectedMechanicId}
                                    onChange={(e) => setSelectedMechanicId(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                >
                                    <option value="">Select an active mechanic...</option>
                                    {mechanics.map(m => (
                                        <option key={m.user_id} value={m.user_id}>
                                            {m.firstname} {m.lastname}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Estimated Travel Time (Minutes)</label>
                                <input 
                                    type="number"
                                    required
                                    min="5"
                                    max="480"
                                    value={etaMinutes}
                                    onChange={(e) => setEtaMinutes(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono"
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                            >
                                {isLoading ? 'Assigning...' : 'Confirm Assignment'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </OfficeStaffLayout>
    );
}
