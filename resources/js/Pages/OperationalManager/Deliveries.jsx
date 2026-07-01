import React, { useState, useEffect } from 'react';
import { router, Link } from '@inertiajs/react';
import OperationalManagerLayout from '../../Layouts/OperationalManagerLayout';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export default function Deliveries({ authUser, deliveries, flash }) {
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    const queryClient = useQueryClient();

    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); // Reset to page 1 on new search
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Fetch Deliveries function
    const fetchDeliveries = async ({ queryKey }) => {
        const [_key, page, search, status] = queryKey;
        const response = await axios.get(`/operational-manager/api/deliveries`, {
            params: {
                page: page,
                search: search,
                status: status
            }
        });
        return response.data;
    };

    const { data, isLoading, isFetching, isPlaceholderData } = useQuery({
        queryKey: ['om-deliveries', currentPage, debouncedSearch, filterStatus],
        queryFn: fetchDeliveries,
        placeholderData: (previousData) => previousData,
    });

    // Prefetch next page
    useEffect(() => {
        if (data?.meta && data.meta.current_page < data.meta.last_page) {
            queryClient.prefetchQuery({
                queryKey: ['om-deliveries', currentPage + 1, debouncedSearch, filterStatus],
                queryFn: fetchDeliveries,
            });
        }
    }, [data, currentPage, debouncedSearch, filterStatus, queryClient]);

    // Auto-refresh every 5 seconds for real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['flash'],
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setLastUpdated(new Date())
            });
            queryClient.invalidateQueries({ queryKey: ['om-deliveries'] });
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'in_transit': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'approved': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return 'Pending Approval';
            case 'approved': return 'Approved';
            case 'in_transit': return 'In Transit';
            case 'delivered': return 'Delivered';
            case 'cancelled': return 'Rejected';
            default: return status?.replace('_', ' ');
        }
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

    const openDetailModal = (delivery) => {
        setSelectedDelivery(delivery);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedDelivery(null);
    };

    const deliveriesList = data?.deliveries || [];

    // Calculate stats
    const total = data?.stats?.total || 0;
    const delivered = data?.stats?.delivered || 0;
    const inTransit = data?.stats?.in_transit || 0;
    const pending = data?.stats?.pending || 0;
    const approved = data?.stats?.approved || 0;

    return (
        <OperationalManagerLayout title="Delivery Management" authUser={authUser}>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Deliveries</h1>
                        <p className="text-slate-500 mt-0.5 text-sm">Monitor and manage delivery operations</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/operational-manager/deliveries/create"
                            className="px-4 py-2 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors font-medium flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Delivery
                        </Link>
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

                {/* Stats Overview */}
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

                {/* Toolbar */}
                <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
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
                            <select
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500 transition-all"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="in_transit">In Transit</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Rejected</option>
                            </select>
                        </div>
                        <div className="text-sm text-gray-500">
                            {data?.meta?.total || 0} results
                        </div>
                    </div>
                </div>

                {/* Deliveries Table */}
                <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden relative">
                    {(isFetching && isPlaceholderData) && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    )}
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
                                {deliveriesList.length > 0 ? (
                                    deliveriesList.map((delivery) => (
                                        <tr key={delivery.delivery_id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="text-sm font-medium text-gray-900">#{delivery.waybill}</span>
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
                                            <p className="text-gray-500">No deliveries found matching your search.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination UI */}
                        {data?.meta && (
                            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                                <button
                                    onClick={() => setCurrentPage(old => Math.max(old - 1, 1))}
                                    disabled={currentPage === 1 || isPlaceholderData}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    &lt; Previous
                                </button>
                                <span className="text-sm text-gray-700">
                                    Page {data.meta.current_page} of {data.meta.last_page || 1}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(old => (data.meta.current_page < data.meta.last_page ? old + 1 : old))}
                                    disabled={currentPage === data.meta.last_page || !data.meta.last_page || isPlaceholderData}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next &gt;
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail Modal */}
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
                                        <h2 className="text-lg font-bold text-slate-900">#{selectedDelivery.waybill}</h2>
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
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
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
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <p className="text-xs text-slate-500">Priority</p>
                                        </div>
                                        <p className="font-medium text-slate-900 text-sm">{selectedDelivery.priority?.toUpperCase()}</p>
                                    </div>
                                </div>

                                {/* Address Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-sm font-semibold text-amber-900">Pickup Address</h3>
                                        </div>
                                        <p className="text-sm text-amber-800">{selectedDelivery.pickup_address}</p>
                                    </div>
                                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-sm font-semibold text-emerald-900">Delivery Address</h3>
                                        </div>
                                        <p className="text-sm text-emerald-800">{selectedDelivery.delivery_address}</p>
                                    </div>
                                </div>

                                {/* Notes */}
                                {selectedDelivery.notes && (
                                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-sm font-semibold text-blue-900">Notes</h3>
                                        </div>
                                        <p className="text-sm text-blue-800">{selectedDelivery.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </OperationalManagerLayout>
    );
}
