import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Trucks({ trucks, stats, authUser, pendingDeliveries = 0, availableDrivers = [] }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingTruck, setEditingTruck] = useState(null);
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [truckToDelete, setTruckToDelete] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [truckToAssign, setTruckToAssign] = useState(null);
    const [selectedDriver, setSelectedDriver] = useState('');
    const [formData, setFormData] = useState({
        plate_number: '',
        vehicle_type: '',
        capacity: '',
        condition: 'good',
        truck_status: 'available',
    });

    const handleAdd = () => {
        setFormData({
            plate_number: '',
            vehicle_type: '',
            capacity: '',
            condition: 'good',
            truck_status: 'available',
        });
        setShowAddModal(true);
    };

    const handleEdit = (truck) => {
        setEditingTruck(truck);
        setFormData({
            plate_number: truck.plate_number,
            vehicle_type: truck.vehicle_type,
            capacity: truck.capacity,
            condition: truck.condition,
            truck_status: truck.truck_status,
        });
        setShowEditModal(true);
    };

    const handleDelete = (truck) => {
        setTruckToDelete(truck);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        if (truckToDelete) {
            router.delete(`/admin/trucks/${truckToDelete.truck_id}`, {
                onSuccess: () => {
                    setSuccessMessage('Truck deleted successfully!');
                    setShowSuccessAnimation(true);
                    setTimeout(() => setShowSuccessAnimation(false), 3000);
                    setShowDeleteConfirm(false);
                    setTruckToDelete(null);
                }
            });
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setTruckToDelete(null);
    };

    const handleAssignClick = (truck) => {
        setTruckToAssign(truck);
        setSelectedDriver('');
        setShowAssignModal(true);
    };

    const handleAssignDriver = (e) => {
        e.preventDefault();
        if (!selectedDriver) return;

        router.post(`/admin/trucks/${truckToAssign.truck_id}/assign-driver`, {
            driver_id: selectedDriver
        }, {
            onSuccess: () => {
                setSuccessMessage('Driver assigned to truck successfully!');
                setShowSuccessAnimation(true);
                setTimeout(() => setShowSuccessAnimation(false), 3000);
                setShowAssignModal(false);
                setTruckToAssign(null);
                setSelectedDriver('');
            }
        });
    };

    const cancelAssign = () => {
        setShowAssignModal(false);
        setTruckToAssign(null);
        setSelectedDriver('');
    };

    const handleToggleStatus = (truck) => {
        const newStatus = truck.truck_status === 'available' ? 'inactive' : 'available';
        router.patch(`/admin/trucks/${truck.truck_id}/toggle-status`, { truck_status: newStatus }, {
            onSuccess: () => {
                setSuccessMessage(`Truck status updated to ${newStatus}!`);
                setShowSuccessAnimation(true);
                setTimeout(() => setShowSuccessAnimation(false), 3000);
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post('/admin/trucks', formData, {
            onSuccess: () => {
                setSuccessMessage('Truck added successfully!');
                setShowSuccessAnimation(true);
                setTimeout(() => setShowSuccessAnimation(false), 3000);
                setShowAddModal(false);
                setFormData({
                    plate_number: '',
                    vehicle_type: '',
                    capacity: '',
                    condition: 'good',
                    truck_status: 'available',
                });
            }
        });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        router.put(`/admin/trucks/${editingTruck.truck_id}`, formData, {
            onSuccess: () => {
                setSuccessMessage('Truck updated successfully!');
                setShowSuccessAnimation(true);
                setTimeout(() => setShowSuccessAnimation(false), 3000);
                setShowEditModal(false);
                setEditingTruck(null);
            }
        });
    };

    const getConditionBadge = (condition) => {
        switch(condition) {
            case 'excellent': return 'bg-emerald-50 text-emerald-700 border border-emerald-200/50';
            case 'good': return 'bg-blue-50 text-blue-700 border border-blue-200/50';
            case 'fair': return 'bg-amber-50 text-amber-700 border border-amber-200/50';
            case 'poor': return 'bg-rose-50 text-rose-700 border border-rose-200/50';
            case 'needs_maintenance': return 'bg-rose-50 text-rose-700 border border-rose-200/50';
            default: return 'bg-slate-50 text-slate-700 border border-slate-200';
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'available': return 'bg-emerald-50 text-emerald-700 border border-emerald-200/50 hover:bg-emerald-100';
            case 'in_use': return 'bg-blue-50 text-blue-700 border border-blue-200/50 hover:bg-blue-100';
            case 'maintenance': return 'bg-amber-50 text-amber-700 border border-amber-200/50 hover:bg-amber-100';
            case 'inactive': return 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100';
            default: return 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100';
        }
    };

    return (
        <AdminLayout title="Truck Management" authUser={authUser} activeMenu="trucks" pendingDeliveries={pendingDeliveries}>
            <div className="space-y-6">
                
                {/* Success Notification */}
                {showSuccessAnimation && (
                    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
                        <div className="bg-white border border-emerald-100 rounded-xl p-4 shadow-lg shadow-emerald-500/10 flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-gray-700">{successMessage}</p>
                        </div>
                    </div>
                )}

                <div className="flex justify-end mb-4">
                    <button
                        onClick={handleAdd}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg shadow-sm transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add Truck</span>
                    </button>
                </div>

                {/* Stats Cards - Compact Premium */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Fleet', value: stats?.total || 0, icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z', bg: 'bg-slate-100', iconColor: 'text-slate-600', valColor: 'text-slate-900' },
                        { label: 'Available', value: stats?.available || 0, icon: 'M5 13l4 4L19 7', bg: 'bg-emerald-50', iconColor: 'text-emerald-600', valColor: 'text-emerald-600' },
                        { label: 'In Use', value: stats?.in_use || 0, icon: 'M13 10V3L4 14h7v7l9-11h-7z', bg: 'bg-blue-50', iconColor: 'text-blue-600', valColor: 'text-blue-600' },
                        { label: 'Maintenance', value: stats?.maintenance || 0, icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z', bg: 'bg-amber-50', iconColor: 'text-amber-600', valColor: 'text-amber-600' }
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center`}>
                                    <svg className={`w-4 h-4 ${stat.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">{stat.label}</p>
                                    <p className={`text-lg font-semibold ${stat.valColor}`}>{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Trucks Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50/80">
                                <tr>
                                    {['Unique ID', 'Plate Number', 'Vehicle Type', 'Capacity', 'Condition', 'Status', 'Actions'].map((header) => (
                                        <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {trucks.data.length > 0 ? (
                                    trucks.data.map((truck) => (
                                        <tr key={truck.truck_id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                                                    {truck.unique_id}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-sm">
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-sm font-semibold text-slate-900">{truck.plate_number}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-slate-600">
                                                {truck.vehicle_type}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-slate-600">
                                                {truck.capacity} tons
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-0.5 text-[10px] rounded-md font-bold uppercase tracking-wider ${getConditionBadge(truck.condition)}`}>
                                                    {truck.condition?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <button
                                                    onClick={() => truck.truck_status !== 'in_use' && handleToggleStatus(truck)}
                                                    disabled={truck.truck_status === 'in_use'}
                                                    className={`inline-flex px-2 py-0.5 text-[10px] rounded-md font-bold uppercase tracking-wider transition-colors ${getStatusBadge(truck.truck_status)} ${truck.truck_status === 'in_use' ? 'opacity-90 cursor-not-allowed' : ''}`}
                                                    title={truck.truck_status === 'in_use' ? 'Cannot change status while assigned to a driver' : 'Toggle Status'}
                                                >
                                                    {truck.truck_status?.replace('_', ' ')}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1">
                                                    {truck.truck_status === 'available' && availableDrivers.length > 0 && (
                                                        <button
                                                            onClick={() => handleAssignClick(truck)}
                                                            className="p-1.5 text-slate-500 hover:text-[#10B981] hover:bg-emerald-50 rounded-md transition-colors"
                                                            title="Assign Driver"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleEdit(truck)}
                                                        className="p-1.5 text-slate-500 hover:text-[#10B981] hover:bg-emerald-50 rounded-md transition-colors"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(truck)}
                                                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-10 text-center">
                                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-sm font-medium text-slate-900 mb-1">No trucks found</h3>
                                            <p className="text-xs text-slate-500">Add your fleet vehicles to get started</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        
                        {/* Pagination UI */}
                        {trucks.last_page > 1 && (
                            <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-white">
                                <button
                                    onClick={() => router.get(trucks.prev_page_url, {}, { preserveState: true, preserveScroll: true })}
                                    disabled={!trucks.prev_page_url}
                                    className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    &lt; Previous
                                </button>
                                <span className="text-sm text-slate-700">
                                    Page {trucks.current_page} of {trucks.last_page}
                                </span>
                                <button
                                    onClick={() => router.get(trucks.next_page_url, {}, { preserveState: true, preserveScroll: true })}
                                    disabled={!trucks.next_page_url}
                                    className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next &gt;
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Truck Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
                        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto border border-slate-100">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Add Fleet Vehicle</h3>
                                    <p className="text-xs text-slate-500">Register vehicle parameters</p>
                                </div>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Plate Number</label>
                                    <input type="text" value={formData.plate_number} onChange={(e) => setFormData({...formData, plate_number: e.target.value})} 
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 hover:border-slate-300 focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 outline-none font-medium" placeholder="ABC-1234" required />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Vehicle Type</label>
                                    <input type="text" value={formData.vehicle_type} onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})} 
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 hover:border-slate-300 focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 outline-none font-medium" placeholder="e.g. Wing Van" required />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Capacity (tons)</label>
                                    <input type="number" step="0.1" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} 
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 hover:border-slate-300 focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 outline-none font-medium" placeholder="e.g. 10.0" required />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Condition</label>
                                        <select value={formData.condition} onChange={(e) => setFormData({...formData, condition: e.target.value})} 
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm hover:border-slate-300 focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 outline-none font-medium appearance-none">
                                            <option value="excellent">Excellent</option>
                                            <option value="good">Good</option>
                                            <option value="fair">Fair</option>
                                            <option value="poor">Poor</option>
                                            <option value="needs_maintenance">Needs Maint.</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Status</label>
                                        <select value="available" disabled
                                            className="w-full px-3 py-2 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl text-sm outline-none font-medium appearance-none cursor-not-allowed">
                                            <option value="available">Available</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="flex justify-end gap-2 pt-3">
                                    <button type="button" onClick={() => setShowAddModal(false)}
                                        className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors text-xs font-bold">
                                        Cancel
                                    </button>
                                    <button type="submit" className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md shadow-emerald-500/10 transition-all hover:shadow-lg">
                                        Add Vehicle
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Truck Modal */}
            {showEditModal && editingTruck && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
                        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto border border-slate-100">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Edit Fleet Vehicle</h3>
                                    <p className="text-xs text-slate-500">Update vehicle details</p>
                                </div>
                            </div>
                            
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Plate Number</label>
                                    <input type="text" value={formData.plate_number} onChange={(e) => setFormData({...formData, plate_number: e.target.value})} 
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 hover:border-slate-300 focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 outline-none font-medium" required />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Vehicle Type</label>
                                    <input type="text" value={formData.vehicle_type} onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})} 
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 hover:border-slate-300 focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 outline-none font-medium" required />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Capacity (tons)</label>
                                    <input type="number" step="0.1" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} 
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 hover:border-slate-300 focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 outline-none font-medium" required />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Condition</label>
                                        <select value={formData.condition} onChange={(e) => setFormData({...formData, condition: e.target.value})} 
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm hover:border-slate-300 focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 outline-none font-medium appearance-none">
                                            <option value="excellent">Excellent</option>
                                            <option value="good">Good</option>
                                            <option value="fair">Fair</option>
                                            <option value="poor">Poor</option>
                                            <option value="needs_maintenance">Needs Maint.</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Status</label>
                                        <select value={formData.truck_status} onChange={(e) => setFormData({...formData, truck_status: e.target.value})} 
                                            disabled={editingTruck.truck_status === 'in_use'}
                                            className={`w-full px-3 py-2 border border-slate-200 rounded-xl text-sm transition-all duration-200 outline-none font-medium appearance-none ${editingTruck.truck_status === 'in_use' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50 hover:border-slate-300 focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10'}`}>
                                            <option value="available">Available</option>
                                            {editingTruck.truck_status === 'in_use' && <option value="in_use">In Use</option>}
                                            <option value="maintenance">Maintenance</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="flex justify-end gap-2 pt-3">
                                    <button type="button" onClick={() => setShowEditModal(false)}
                                        className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors text-xs font-bold">
                                        Cancel
                                    </button>
                                    <button type="submit" className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md shadow-emerald-500/10 transition-all hover:shadow-lg">
                                        Update Vehicle
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && truckToDelete && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={cancelDelete}></div>
                        <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Delete Fleet Vehicle?</h3>
                                    <p className="text-xs text-slate-500 font-medium">This action is permanent</p>
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 rounded-xl p-4 mb-4">
                                <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                                    <span className="text-slate-400">Plate Number:</span> {truckToDelete.plate_number}<br />
                                    <span className="text-slate-400">Vehicle Type:</span> {truckToDelete.vehicle_type}
                                </p>
                            </div>
                            
                            <div className="flex justify-end gap-2">
                                <button onClick={cancelDelete}
                                    className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors text-xs font-bold">
                                    Cancel
                                </button>
                                <button onClick={confirmDelete}
                                    className="px-4 py-2 text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors text-xs font-bold shadow-md shadow-rose-500/10">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Driver Modal */}
            {showAssignModal && truckToAssign && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={cancelAssign}></div>
                        <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Assign Fleet Operator</h3>
                                    <p className="text-xs text-slate-500">Vehicle: {truckToAssign.plate_number}</p>
                                </div>
                            </div>

                            {availableDrivers.length === 0 ? (
                                <div className="text-center py-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-xs font-semibold text-slate-500">No active available drivers rostered</p>
                                </div>
                            ) : (
                                <form onSubmit={handleAssignDriver} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                                            Select Operator
                                        </label>
                                        <select
                                            value={selectedDriver}
                                            onChange={(e) => setSelectedDriver(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm hover:border-slate-300 focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 outline-none font-medium appearance-none"
                                            required
                                        >
                                            <option value="">Choose operator...</option>
                                            {availableDrivers.map((driver) => (
                                                <option key={driver.driver_id} value={driver.driver_id}>
                                                    {driver.first_name} {driver.last_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={cancelAssign}
                                            className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors text-xs font-bold"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!selectedDriver}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold shadow-md transition-all ${
                                                selectedDriver
                                                    ? 'bg-[#10B981] hover:bg-[#059669] text-white shadow-emerald-500/10 hover:shadow-lg'
                                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                            }`}
                                        >
                                            Assign
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
