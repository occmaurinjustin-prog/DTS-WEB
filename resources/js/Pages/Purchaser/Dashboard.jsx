import React, { useState } from 'react';
import PurchaserLayout from '../../Layouts/PurchaserLayout';
import { router } from '@inertiajs/react';
import { toast, Toaster } from 'react-hot-toast';

export default function Dashboard({ authUser, stats, partRequests }) {
    const [processingId, setProcessingId] = useState(null);

    const handleMarkPurchased = (id) => {
        if (!confirm('Mark this request as purchased?')) return;
        
        setProcessingId(id);
        router.put(`/purchaser/part-requests/${id}/status`, { status: 'purchased' }, {
            onSuccess: () => {
                toast.success('Marked as purchased');
                setProcessingId(null);
            },
            onError: () => {
                toast.error('Failed to update status');
                setProcessingId(null);
            }
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved': return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">To Purchase</span>;
            case 'purchased': return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">Purchased</span>;
            case 'completed': return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Completed (In Stock)</span>;
            default: return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">{status}</span>;
        }
    };

    return (
        <PurchaserLayout title="Purchaser Dashboard" authUser={authUser} activeMenu="dashboard">
            <Toaster position="top-right" />
            <div className="space-y-6 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-md">
                            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Procurement Control</h1>
                            <p className="text-xs text-slate-500 font-medium">Overview of purchase orders, suppliers, and inventory</p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-50 text-purple-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500">Total Requests</p>
                                <p className="text-xl font-bold text-slate-900">{stats?.total_orders || 0}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500">Pending Purchase</p>
                                <p className="text-xl font-bold text-slate-900">{stats?.pending_purchase || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500">Purchased</p>
                                <p className="text-xl font-bold text-slate-900">{stats?.purchased || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Empty State Area */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-8 text-center">
                    <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h3 className="text-slate-900 font-bold mb-1">Purchaser Dashboard Ready</h3>
                    <p className="text-slate-500 text-sm max-w-md mx-auto">This portal has been set up. Procurement tracking and supplier features will appear here.</p>
                </div>
            </div>
        </PurchaserLayout>
    );
}
