import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Deliveries({ authUser, pendingDeliveries, allDeliveries, flash }) {
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'all'
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sentToDriver, setSentToDriver] = useState(new Set()); // Track deliveries sent to driver

    // Auto-refresh every 5 seconds for real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ 
                only: ['pendingDeliveries', 'allDeliveries'], 
                preserveScroll: true, 
                preserveState: true,
                onSuccess: () => setLastUpdated(new Date())
            });
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status) => {
        switch(status) {
            case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'in_transit': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'approved': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'delivered': return 'M5 13l4 4L19 7';
            case 'in_transit': return 'M13 10V3L4 14h7v7l9-11h-7z';
            case 'pending': return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
            case 'approved': return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
            case 'cancelled': return 'M6 18L18 6M6 6l12 12';
            default: return 'M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
        }
    };

    const getStatusLabel = (status) => {
        switch(status) {
            case 'pending': return 'Pending Approval';
            case 'approved': return 'Approved';
            case 'in_transit': return 'In Transit';
            case 'delivered': return 'Delivered';
            case 'cancelled': return 'Rejected';
            default: return status?.replace('_', ' ');
        }
    };

    const handleApprove = (deliveryId) => {
        if (confirm('Are you sure you want to approve this delivery request?')) {
            router.patch(`/admin/deliveries/${deliveryId}/approve`, {}, {
                onSuccess: () => {
                    setShowDetailModal(false);
                    setSelectedDelivery(null);
                }
            });
        }
    };

    const handleReject = (deliveryId) => {
        if (confirm('Are you sure you want to reject this delivery request? This action cannot be undone.')) {
            router.patch(`/admin/deliveries/${deliveryId}/reject`, {}, {
                onSuccess: () => {
                    setShowDetailModal(false);
                    setSelectedDelivery(null);
                }
            });
        }
    };

    const handleSendToDriver = (delivery) => {
        if (confirm(`Send delivery #${delivery.tracking_number} to driver ${delivery.driver?.user?.firstname} ${delivery.driver?.user?.lastname}?`)) {
            router.post(`/admin/deliveries/${delivery.delivery_id}/send-to-driver`, {
                driver_id: delivery.driver?.driver_id,
            }, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    // Add to sent to driver tracking
                    setSentToDriver(prev => new Set([...prev, delivery.delivery_id]));
                    setShowDetailModal(false);
                    setTimeout(() => setSelectedDelivery(null), 300);
                },
                onError: (errors) => {
                    alert('Failed to send delivery details: ' + JSON.stringify(errors));
                }
            });
        }
    };

    const openDetailModal = (delivery) => {
        setSelectedDelivery(delivery);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setTimeout(() => setSelectedDelivery(null), 300);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimelineSteps = (delivery) => {
        const steps = [
            { 
                status: 'created', 
                label: 'Request Created', 
                date: delivery.created_at,
                description: `Requested by ${delivery.user?.username || 'Unknown'}`
            }
        ];

        if (delivery.delivery_status === 'cancelled') {
            steps.push({
                status: 'rejected',
                label: 'Request Rejected',
                date: delivery.rejected_at,
                description: 'The delivery request was rejected'
            });
        } else if (delivery.delivery_status === 'approved' || delivery.delivery_status === 'in_transit' || delivery.delivery_status === 'delivered') {
            steps.push({
                status: 'approved',
                label: 'Request Approved',
                date: delivery.approved_at,
                description: 'The delivery request was approved by admin'
            });
        }

        if (delivery.delivery_status === 'in_transit' || delivery.delivery_status === 'delivered') {
            steps.push({
                status: 'in_transit',
                label: 'In Transit',
                date: null,
                description: 'Driver is on the way'
            });
        }

        if (delivery.delivery_status === 'delivered') {
            steps.push({
                status: 'delivered',
                label: 'Delivered',
                date: null,
                description: 'Package successfully delivered'
            });
        }

        return steps;
    };

    // Calculate real stats
    const total = allDeliveries?.length || 0;
    const delivered = allDeliveries?.filter(d => d.delivery_status === 'delivered').length || 0;
    const inTransit = allDeliveries?.filter(d => d.delivery_status === 'in_transit').length || 0;
    const pending = allDeliveries?.filter(d => d.delivery_status === 'pending').length || 0;
    const approved = allDeliveries?.filter(d => d.delivery_status === 'approved').length || 0;
    const rejected = allDeliveries?.filter(d => d.delivery_status === 'cancelled').length || 0;

    const stats = [
        { label: 'Total Requests', value: total, icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', color: 'from-slate-500 to-slate-600' },
        { label: 'Pending Approval', value: pending, icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'from-amber-500 to-orange-500' },
        { label: 'Approved', value: approved, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'from-indigo-500 to-violet-500' },
        { label: 'In Transit', value: inTransit, icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'from-blue-500 to-cyan-500' },
    ];

    // Filter deliveries based on search and status filter
    const filteredDeliveries = allDeliveries?.filter(delivery => {
        const matchesSearch = !searchTerm || 
            delivery.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            delivery.client?.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            delivery.driver?.user?.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            delivery.driver?.user?.lastname?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || delivery.delivery_status === filterStatus;
        
        return matchesSearch && matchesStatus;
    }) || [];

    return (
        <AdminLayout title="Delivery Management" authUser={authUser} activeMenu="deliveries" pendingDeliveries={pendingDeliveries?.length || 0}>
            <div className="space-y-8">
                {/* Header - Compact SaaS */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Deliveries</h1>
                        <p className="text-slate-500 mt-0.5 text-sm">Manage delivery requests and tracking</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-medium text-emerald-600">Live</span>
                        </div>
                        <span className="text-xs text-slate-400">{lastUpdated.toLocaleTimeString()}</span>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-indigo-800 font-medium">{flash.success}</p>
                    </div>
                )}

                {/* Enhanced Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Total</p>
                                <p className="text-lg font-semibold text-slate-900">{total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Pending</p>
                                <p className="text-lg font-semibold text-amber-600">{pending}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">In Transit</p>
                                <p className="text-lg font-semibold text-blue-600">{inTransit}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Delivered</p>
                                <p className="text-lg font-semibold text-emerald-600">{delivered}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs - Compact */}
                <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm">
                    <div className="flex border-b border-slate-100">
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                                activeTab === 'pending'
                                    ? 'border-[#4F46E5] text-[#4F46E5]'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            Pending {pending > 0 && <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">{pending}</span>}
                        </button>
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                                activeTab === 'all'
                                    ? 'border-[#4F46E5] text-[#4F46E5]'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            All Deliveries
                        </button>
                    </div>

                    {/* Toolbar */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search deliveries..."
                                        className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500 transition-all w-64"
                                    />
                                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                {activeTab === 'all' && (
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500 transition-all"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="in_transit">In Transit</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Rejected</option>
                                    </select>
                                )}
                            </div>
                            <div className="text-sm text-gray-500">
                                {activeTab === 'pending' ? pendingDeliveries?.length || 0 : filteredDeliveries.length} results
                            </div>
                        </div>
                    </div>

                    {/* Pending Approvals Section */}
                    {activeTab === 'pending' && (
                        <div className="divide-y divide-gray-100">
                            {pendingDeliveries && pendingDeliveries.length > 0 ? (
                                pendingDeliveries.map((delivery) => (
                                    <div key={delivery.delivery_id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-sm font-semibold text-amber-600">#{delivery.tracking_number}</span>
                                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                                        delivery.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                                        delivery.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {delivery.priority?.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-500 text-xs">Client</p>
                                                        <p className="text-gray-900 font-medium">{delivery.client?.client_name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 text-xs">Driver</p>
                                                        <p className="text-gray-900 font-medium">{delivery.driver?.user?.firstname} {delivery.driver?.user?.lastname}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 text-xs">Weight</p>
                                                        <p className="text-gray-900 font-medium">{delivery.weight_tons} tons</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 text-xs">Created</p>
                                                        <p className="text-gray-900 font-medium">{new Date(delivery.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => openDetailModal(delivery)}
                                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                                <button 
                                                    onClick={() => handleApprove(delivery.delivery_id)}
                                                    className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                                                >
                                                    Approve
                                                </button>
                                                <button 
                                                    onClick={() => handleReject(delivery.delivery_id)}
                                                    className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending approvals</h3>
                                    <p className="text-gray-500">All delivery requests have been reviewed</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* All Deliveries Table */}
                    {activeTab === 'all' && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['Tracking', 'Client', 'Driver', 'Status', 'Weight', 'Created', 'Actions'].map((header) => (
                                            <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredDeliveries.length > 0 ? (
                                        filteredDeliveries.map((delivery) => (
                                            <tr key={delivery.delivery_id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-gray-900">#{delivery.tracking_number}</span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                    {delivery.client?.client_name}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                    {delivery.driver?.user?.firstname} {delivery.driver?.user?.lastname}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(delivery.delivery_status)}`}>
                                                        {getStatusLabel(delivery.delivery_status)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                    {delivery.weight_tons} tons
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(delivery.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <button 
                                                        onClick={() => openDetailModal(delivery)}
                                                        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-12 text-center">
                                                <p className="text-gray-500">No deliveries found</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Detail Modal - Indigo Theme */}
                {showDetailModal && selectedDelivery && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-200">
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#4F46E5] rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">#{selectedDelivery.tracking_number}</h2>
                                        <p className="text-xs text-slate-500">{formatDate(selectedDelivery.created_at)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedDelivery.delivery_status)}`}>
                                        {getStatusLabel(selectedDelivery.delivery_status)}
                                    </span>
                                    <button 
                                        onClick={closeDetailModal}
                                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Info Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-6 h-6 bg-[#4F46E5]/10 rounded-lg flex items-center justify-center">
                                                <svg className="w-3 h-3 text-[#4F46E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <p className="text-xs text-slate-500">Client</p>
                                        </div>
                                        <p className="font-medium text-slate-900 text-sm">{selectedDelivery.client?.client_name}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-6 h-6 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                                <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <p className="text-xs text-slate-500">Driver</p>
                                        </div>
                                        <p className="font-medium text-slate-900 text-sm">{selectedDelivery.driver?.user?.firstname} {selectedDelivery.driver?.user?.lastname}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-6 h-6 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                                                <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                                </svg>
                                            </div>
                                            <p className="text-xs text-slate-500">Weight</p>
                                        </div>
                                        <p className="font-medium text-slate-900 text-sm">{selectedDelivery.weight_tons} tons</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-6 h-6 bg-amber-500/10 rounded-lg flex items-center justify-center">
                                                <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            </div>
                                            <p className="text-xs text-slate-500">Priority</p>
                                        </div>
                                        <p className="font-medium text-slate-900 text-sm">{selectedDelivery.priority?.toUpperCase()}</p>
                                    </div>
                                </div>

                                {/* Addresses */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-[#4F46E5] rounded-lg flex items-center justify-center flex-shrink-0">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs text-[#4F46E5] font-medium uppercase mb-1">Pickup Address</p>
                                                <p className="font-medium text-slate-900 text-sm">{selectedDelivery.pickup_address}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs text-blue-600 font-medium uppercase mb-1">Delivery Address</p>
                                                <p className="font-medium text-slate-900 text-sm">{selectedDelivery.delivery_address}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Item Description */}
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 bg-slate-200 rounded-lg flex items-center justify-center">
                                            <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium uppercase">Item Description</p>
                                    </div>
                                    <p className="font-medium text-slate-900 text-sm ml-8">{selectedDelivery.item_description}</p>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between sticky bottom-0">
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <div className="w-6 h-6 bg-slate-200 rounded-lg flex items-center justify-center">
                                        <span className="text-slate-600 font-medium">{selectedDelivery.user?.username?.charAt(0).toUpperCase()}</span>
                                    </div>
                                    Requested by {selectedDelivery.user?.username}
                                </div>
                                <div className="flex gap-2">
                                    {selectedDelivery.delivery_status === 'pending' && (
                                        <>
                                            <button 
                                                onClick={() => handleReject(selectedDelivery.delivery_id)}
                                                className="px-4 py-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                Reject
                                            </button>
                                            <button 
                                                onClick={() => handleApprove(selectedDelivery.delivery_id)}
                                                className="px-4 py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-500/20"
                                            >
                                                Approve
                                            </button>
                                        </>
                                    )}
                                    {selectedDelivery.delivery_status !== 'pending' && selectedDelivery.delivery_status !== 'cancelled' && (
                                        <>
                                            {sentToDriver.has(selectedDelivery.delivery_id) ? (
                                                <button 
                                                    disabled
                                                    className="px-4 py-2 bg-gray-400 text-white text-xs font-medium rounded-lg cursor-not-allowed opacity-75 flex items-center gap-1.5"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Already Sent
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleSendToDriver(selectedDelivery)}
                                                    className="px-4 py-2 bg-[#4F46E5] text-white text-xs font-medium rounded-lg hover:bg-[#4338CA] transition-colors shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                    </svg>
                                                    Send to Driver
                                                </button>
                                            )}
                                            <button 
                                                onClick={closeDetailModal}
                                                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors"
                                            >
                                                Close
                                            </button>
                                        </>
                                    )}
                                    {selectedDelivery.delivery_status === 'cancelled' && (
                                        <button 
                                            onClick={closeDetailModal}
                                            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            Close
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
