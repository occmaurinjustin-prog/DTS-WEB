import React, { useState, useEffect } from 'react';
import { router, Link } from '@inertiajs/react';
import OperationalManagerLayout from '../../Layouts/OperationalManagerLayout';

// Status Badge Component
function StatusBadge({ delivery_status }) {
    const styles = {
        pending: 'bg-amber-50 text-amber-700 border-amber-200',
        approved: 'bg-blue-50 text-blue-700 border-blue-200',
        in_transit: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        cancelled: 'bg-red-50 text-red-700 border-red-200',
    };
    return (
        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-md border ${styles[delivery_status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
            {delivery_status?.replace('_', ' ')}
        </span>
    );
}

export default function RecentDeliveries({ authUser, deliveries }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    // Auto-refresh every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ 
                only: ['deliveries'], 
                preserveScroll: true, 
                preserveState: true,
                onSuccess: () => setLastUpdated(new Date())
            });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const openDetailModal = (delivery) => {
        setSelectedDelivery(delivery);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedDelivery(null);
    };

    const filteredDeliveries = deliveries?.filter(delivery => {
        const matchesSearch = !searchTerm || 
            delivery.waybill?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            delivery.client?.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            delivery.driver?.user?.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            delivery.driver?.user?.lastname?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || delivery.delivery_status === filterStatus;
        
        return matchesSearch && matchesStatus;
    }) || [];

    const stats = {
        total: deliveries?.length || 0,
        pending: deliveries?.filter(d => d.delivery_status === 'pending').length || 0,
        approved: deliveries?.filter(d => d.delivery_status === 'approved').length || 0,
        in_transit: deliveries?.filter(d => d.delivery_status === 'in_transit').length || 0,
        delivered: deliveries?.filter(d => d.delivery_status === 'delivered').length || 0,
    };

    return (
        <OperationalManagerLayout title="Recent Deliveries" authUser={authUser} activeMenu="deliveries">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shadow-md">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-base font-semibold text-gray-900">Recent Delivery Requests</h1>
                            <p className="text-xs text-gray-500">View and track all your delivery requests</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/operational-manager/deliveries"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Request
                        </Link>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-5 gap-3 mb-4">
                    {[
                        { label: 'Total', value: stats.total, color: 'gray', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                        { label: 'Pending', value: stats.pending, color: 'amber', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                        { label: 'Approved', value: stats.approved, color: 'blue', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                        { label: 'In Transit', value: stats.in_transit, color: 'indigo', icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0' },
                        { label: 'Delivered', value: stats.delivered, color: 'emerald', icon: 'M5 13l4 4L19 7' },
                    ].map((stat, i) => (
                        <button
                            key={i}
                            onClick={() => setFilterStatus(stat.label.toLowerCase().replace(' ', '_') === 'total' ? 'all' : stat.label.toLowerCase().replace(' ', '_'))}
                            className={`bg-white rounded-lg border p-2.5 flex items-center gap-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all ${
                                (filterStatus === 'all' && stat.label === 'Total') || filterStatus === stat.label.toLowerCase().replace(' ', '_')
                                    ? `border-${stat.color}-300 ring-1 ring-${stat.color}-200` 
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <div className={`w-7 h-7 rounded-md bg-${stat.color}-50 flex items-center justify-center`}>
                                <svg className={`w-3.5 h-3.5 text-${stat.color}-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                                </svg>
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] text-gray-500">{stat.label}</p>
                                <p className="text-sm font-semibold text-gray-800">{stat.value}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-3 mb-4 flex items-center gap-3">
                    <div className="flex-1 relative">
                        <svg className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by tracking #, client, or driver..."
                            className="w-full pl-9 pr-3 py-1.5 bg-[#f8fafc] border border-gray-200 rounded-lg text-xs text-gray-700 placeholder:text-gray-400 hover:border-gray-300 focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/10 focus:bg-white transition-all outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-500">Filter:</span>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-2.5 py-1.5 bg-[#f8fafc] border border-gray-200 rounded-lg text-xs text-gray-700 hover:border-gray-300 focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/10 transition-all outline-none"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="in_transit">In Transit</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    {(searchTerm || filterStatus !== 'all') && (
                        <button
                            onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
                            className="px-2.5 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Deliveries List */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="px-3 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700">
                            {filteredDeliveries.length} delivery{filteredDeliveries.length !== 1 ? 'ies' : 'y'} found
                        </span>
                        <span className="text-[10px] text-gray-400">
                            Updated {lastUpdated.toLocaleTimeString()}
                        </span>
                    </div>
                    
                    {filteredDeliveries.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {filteredDeliveries.map((delivery) => (
                                <div key={delivery.delivery_id} className="px-3 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center border border-gray-100">
                                            <span className="text-xs font-semibold text-gray-600">#{delivery.waybill?.slice(-4)}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-gray-800">{delivery.client?.client_name}</p>
                                                <StatusBadge delivery_status={delivery.delivery_status} />
                                            </div>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    {delivery.driver?.user?.firstname} {delivery.driver?.user?.lastname}
                                                </span>
                                                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                                    </svg>
                                                    {delivery.weight_tons} tons
                                                </span>
                                                <span className="text-[10px] text-gray-400">
                                                    {new Date(delivery.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => openDetailModal(delivery)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#dc2626] bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        View Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="px-3 py-12 text-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-gray-700 mb-1">No deliveries found</p>
                            <p className="text-xs text-gray-500">
                                {searchTerm || filterStatus !== 'all' 
                                    ? 'Try adjusting your search or filters'
                                    : 'Create your first delivery request'
                                }
                            </p>
                        </div>
                    )}
                </div>

                {/* Detail Modal */}
                {showDetailModal && selectedDelivery && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                            <div className="px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-white">Delivery #{selectedDelivery.waybill}</h3>
                                    </div>
                                </div>
                                <button onClick={closeDetailModal} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-[#f8fafc] rounded-lg p-2.5">
                                        <p className="text-[10px] text-gray-500 uppercase">Client</p>
                                        <p className="text-xs font-medium text-gray-800">{selectedDelivery.client?.client_name}</p>
                                    </div>
                                    <div className="bg-[#f8fafc] rounded-lg p-2.5">
                                        <p className="text-[10px] text-gray-500 uppercase">Status</p>
                                        <StatusBadge delivery_status={selectedDelivery.delivery_status} />
                                    </div>
                                    <div className="bg-[#f8fafc] rounded-lg p-2.5">
                                        <p className="text-[10px] text-gray-500 uppercase">Driver</p>
                                        <p className="text-xs font-medium text-gray-800">{selectedDelivery.driver?.user?.firstname} {selectedDelivery.driver?.user?.lastname}</p>
                                    </div>
                                    <div className="bg-[#f8fafc] rounded-lg p-2.5">
                                        <p className="text-[10px] text-gray-500 uppercase">Weight</p>
                                        <p className="text-xs font-medium text-gray-800">{selectedDelivery.weight_tons} tons</p>
                                    </div>
                                </div>
                                <div className="bg-[#f8fafc] rounded-lg p-2.5">
                                    <p className="text-[10px] text-gray-500 uppercase mb-1">Pickup Address</p>
                                    <p className="text-xs text-gray-700">{selectedDelivery.pickup_address}</p>
                                </div>
                                <div className="bg-[#f8fafc] rounded-lg p-2.5">
                                    <p className="text-[10px] text-gray-500 uppercase mb-1">Delivery Address</p>
                                    <p className="text-xs text-gray-700">{selectedDelivery.delivery_address}</p>
                                </div>
                                <div className="bg-[#f8fafc] rounded-lg p-2.5">
                                    <p className="text-[10px] text-gray-500 uppercase mb-1">Item Description</p>
                                    <p className="text-xs text-gray-700">{selectedDelivery.item_description}</p>
                                </div>
                                {selectedDelivery.approved_at && (
                                    <div className="bg-[#f8fafc] rounded-lg p-2.5">
                                        <p className="text-[10px] text-gray-500 uppercase mb-1">Approved At</p>
                                        <p className="text-xs text-gray-700">{new Date(selectedDelivery.approved_at).toLocaleString()}</p>
                                    </div>
                                )}
                            </div>
                            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                                <Link
                                    href="/operational-manager/deliveries"
                                    className="px-3 py-1.5 bg-gradient-to-r from-[#dc2626] to-[#f87171] text-white text-xs font-medium rounded-lg hover:shadow-md transition-all"
                                >
                                    Create New
                                </Link>
                                <button onClick={closeDetailModal} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </OperationalManagerLayout>
    );
}
