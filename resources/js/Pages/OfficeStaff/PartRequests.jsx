import React, { useState } from 'react';
import OfficeStaffLayout from '@/Layouts/OfficeStaffLayout';
import { Head, router } from '@inertiajs/react';
import { toast, Toaster } from 'react-hot-toast';
import Pagination from '@/Components/Pagination';
import usePagination from '@/hooks/usePagination';

export default function PartRequests({ authUser, partRequests }) {
    const [processingId, setProcessingId] = useState(null);
    const { paginatedData, currentPage, setCurrentPage, totalPages } = usePagination(partRequests, 10);

    const handleStatusUpdate = (id, newStatus) => {
        setProcessingId(id);
        router.put(`/office-staff/part-requests/${id}/status`, { status: newStatus }, {
            onSuccess: () => {
                toast.success(`Request marked as ${newStatus}`);
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
            case 'pending': return <span className="px-2 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-widest">Pending</span>;
            case 'approved': return <span className="px-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold uppercase tracking-widest">Approved (To Purchase)</span>;
            case 'purchased': return <span className="px-2 py-1 bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-bold uppercase tracking-widest">Purchased</span>;
            case 'completed': return <span className="px-2 py-1 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold uppercase tracking-widest">Completed</span>;
            case 'rejected': return <span className="px-2 py-1 bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold uppercase tracking-widest">Rejected</span>;
            default: return <span className="px-2 py-1 bg-zinc-50 border border-zinc-200 text-zinc-700 text-[10px] font-bold uppercase tracking-widest">{status}</span>;
        }
    };

    return (
        <OfficeStaffLayout
            authUser={authUser}
            activeMenu="part_requests"
            title="Part Requests"
        >
            <Toaster position="top-right" />
            <div className="max-w-7xl pb-12">


                <div className="bg-white border border-zinc-200 overflow-hidden">
                    <table className="w-full text-left text-sm text-zinc-600 whitespace-nowrap">
                        <thead className="bg-zinc-50 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider border-b border-zinc-200">
                            <tr>
                                <th className="px-6 py-4">Mechanic</th>
                                <th className="px-6 py-4">Part Name</th>
                                <th className="px-6 py-4">Quantity</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {partRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-zinc-400 font-semibold uppercase tracking-widest text-xs">
                                        No part requests found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((req) => (
                                    <tr key={req.id} className="hover:bg-zinc-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-zinc-900">
                                            {req.mechanic?.firstname} {req.mechanic?.lastname}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-zinc-800">{req.part_name}</span>
                                            {req.inventory_id && (
                                                <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-0.5">Existing Inventory</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-black text-lg text-zinc-900">{req.quantity}</td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <p className="truncate font-medium text-zinc-600" title={req.reason}>
                                                {req.reason}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(req.status)}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-zinc-500">
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {req.status === 'pending' && (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleStatusUpdate(req.id, 'approved')}
                                                        disabled={processingId === req.id}
                                                        className="px-4 py-1.5 bg-zinc-900 text-white border border-zinc-900 hover:bg-zinc-800 transition-colors disabled:opacity-50 text-[10px] font-bold uppercase tracking-widest"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(req.id, 'rejected')}
                                                        disabled={processingId === req.id}
                                                        className="px-4 py-1.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50 text-[10px] font-bold uppercase tracking-widest"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                            {req.status === 'purchased' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(req.id, 'completed')}
                                                    disabled={processingId === req.id}
                                                    className="px-4 py-1.5 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors disabled:opacity-50 text-[10px] font-bold uppercase tracking-widest"
                                                    title="Mark as completed/delivered to warehouse"
                                                >
                                                    Mark Completed
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {partRequests.length > 0 && (
                    <div className="bg-white border-b border-x border-zinc-200">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={partRequests.length}
                            itemsPerPage={10}
                        />
                    </div>
                )}
            </div>
        </OfficeStaffLayout>
    );
}
