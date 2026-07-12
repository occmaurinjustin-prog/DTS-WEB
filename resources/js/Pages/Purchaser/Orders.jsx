import React, { useState } from 'react';
import PurchaserLayout from '../../Layouts/PurchaserLayout';
import { router } from '@inertiajs/react';
import { toast, Toaster } from 'react-hot-toast';

export default function Orders({ authUser, stats, partRequests }) {
    const [processingId, setProcessingId] = useState(null);

    const handleMarkPurchased = (id) => {
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
        <PurchaserLayout title="Purchase Orders" authUser={authUser} activeMenu="orders">
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

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50">
                        <h2 className="text-lg font-bold text-slate-800">Approved Part Requests</h2>
                        <p className="text-sm text-slate-500">Items that need to be purchased</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-white border-b border-slate-200 text-slate-700">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Mechanic</th>
                                    <th className="px-4 py-3 font-semibold">Part Name</th>
                                    <th className="px-4 py-3 font-semibold">Quantity</th>
                                    <th className="px-4 py-3 font-semibold">Reason</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                    <th className="px-4 py-3 font-semibold">Date</th>
                                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {(!partRequests || partRequests.length === 0) ? (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                                            No part requests pending purchase.
                                        </td>
                                    </tr>
                                ) : (
                                    partRequests.map((req) => (
                                        <tr key={req.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-900">
                                                {req.mechanic?.firstname} {req.mechanic?.lastname}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-indigo-600">
                                                {req.part_name}
                                            </td>
                                            <td className="px-4 py-3">{req.quantity}</td>
                                            <td className="px-4 py-3 max-w-xs truncate" title={req.reason}>
                                                {req.reason}
                                            </td>
                                            <td className="px-4 py-3">
                                                {getStatusBadge(req.status)}
                                            </td>
                                            <td className="px-4 py-3">
                                                {new Date(req.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {req.status === 'approved' && (
                                                    <button
                                                        onClick={() => handleMarkPurchased(req.id)}
                                                        disabled={processingId === req.id}
                                                        className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 text-xs font-semibold"
                                                    >
                                                        Mark Purchased
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </PurchaserLayout>
    );
}
