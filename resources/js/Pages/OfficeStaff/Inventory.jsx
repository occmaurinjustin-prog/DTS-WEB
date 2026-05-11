import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import OfficeStaffLayout from '../../Layouts/OfficeStaffLayout';

// Icons
const Icons = {
    dashboard: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    package: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    plus: 'M12 4v16m8-8H4',
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    filter: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
    edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    close: 'M6 18L18 6M6 6l12 12',
    check: 'M5 13l4 4L19 7',
    alert: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    arrowRight: 'M9 5l7 7-7 7',
    arrowLeft: 'M15 19l-7-7 7-7',
    download: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    upload: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
};

function Icon({ name, className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={Icons[name]} />
        </svg>
    );
}

// Status Badge Component
function StatusBadge({ part_status }) {
    const styles = {
        pending: 'bg-slate-50 text-slate-700 border-slate-200',
        ongoing: 'bg-amber-50 text-amber-700 border-amber-200',
        completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
        available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        in_use: 'bg-blue-50 text-blue-700 border-blue-200',
        maintenance: 'bg-amber-50 text-amber-700 border-amber-200',
        inactive: 'bg-slate-50 text-slate-700 border-slate-200',
        low: 'bg-slate-50 text-slate-700 border-slate-200',
        medium: 'bg-amber-50 text-amber-700 border-amber-200',
        high: 'bg-orange-50 text-orange-700 border-orange-200',
        critical: 'bg-rose-50 text-rose-700 border-rose-200',
        available_stock: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        low_stock: 'bg-amber-50 text-amber-700 border-amber-200',
        out_of_stock: 'bg-rose-50 text-rose-700 border-rose-200',
    };

    const labels = {
        in_use: 'In Use',
        low_stock: 'Low Stock',
        out_of_stock: 'Out of Stock',
    };

    return (
        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${styles[part_status] || styles.pending} shadow-sm`}>
            {labels[part_status] || part_status?.replace('_', ' ')}
        </span>
    );
}

// Modal Component
function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" onClick={onClose} />
                
                <div className={`relative w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-2xl p-6`}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Icon name="close" className="w-5 h-5" />
                        </button>
                    </div>
                    
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function Inventory({ authUser }) {
    const [loading, setLoading] = useState(true);
    const [parts, setParts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPartModal, setShowPartModal] = useState(false);
    const [editingPart, setEditingPart] = useState(null);
    const [errors, setErrors] = useState({});
    
    const [partForm, setPartForm] = useState({
        part_name: '',
        part_number: '',
        category: '',
        quantity: 0,
        min_stock_level: 10,
        part_status: 'available'
    });

    // Fetch inventory data
    const fetchInventory = async () => {
        try {
            const response = await fetch('/office-staff/maintenance/inventory');
            const data = await response.json();
            setParts(data.parts || []);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const filteredParts = parts.filter((part) =>
        part.part_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.part_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddPart = () => {
        setEditingPart(null);
        setPartForm({
            part_name: '',
            part_number: '',
            category: '',
            quantity: 0,
            min_stock_level: 10,
            part_status: 'available'
        });
        setShowPartModal(true);
    };

    const handleEditPart = (part) => {
        setEditingPart(part);
        setPartForm({
            part_name: part.part_name,
            part_number: part.part_number || '',
            category: part.category || '',
            quantity: part.quantity,
            min_stock_level: part.min_stock_level,
            part_status: part.part_status
        });
        setShowPartModal(true);
    };

    const handleSavePart = (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const isEditing = editingPart !== null;
        const url = isEditing 
            ? `/office-staff/maintenance/parts/${editingPart.Inventory_id}`
            : '/office-staff/maintenance/parts';
        const method = isEditing ? 'put' : 'post';

        router[method](url, partForm, {
            onSuccess: () => {
                setLoading(false);
                setShowPartModal(false);
                fetchInventory();
            },
            onError: (errors) => {
                setErrors(errors);
                setLoading(false);
            }
        });
    };

    const handleDeletePart = (partId) => {
        if (confirm('Are you sure you want to delete this part?')) {
            router.delete(`/office-staff/maintenance/parts/${partId}`, {
                onSuccess: () => {
                    fetchInventory();
                }
            });
        }
    };

    // Calculate statistics
    const stats = {
        totalParts: parts.length,
        lowStockItems: parts.filter(p => p.quantity <= p.min_stock_level).length,
        outOfStockItems: parts.filter(p => p.quantity === 0).length,
        totalValue: 0
    };

    return (
        <OfficeStaffLayout title="Inventory" authUser={authUser} activeMenu="inventory">
            <Head title="Inventory Management" />
            
            <div className="px-4 py-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900 tracking-wide">Inventory Management</h1>
                        <p className="text-sm text-slate-500 mt-1 font-light">Manage parts, supplies, and inventory levels</p>
                    </div>
                    <button 
                        onClick={handleAddPart}
                        className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white text-sm font-medium rounded-lg hover:bg-[#4338CA] transition-colors"
                    >
                        <Icon name="plus" className="w-4 h-4" />
                        Add Part
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Parts</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalParts}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                <Icon name="package" className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                                <p className="text-2xl font-bold text-amber-600 mt-1">{stats.lowStockItems}</p>
                            </div>
                            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                                <Icon name="alert" className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                                <p className="text-2xl font-bold text-red-600 mt-1">{stats.outOfStockItems}</p>
                            </div>
                            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                                <Icon name="alert" className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Value</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">N/A</p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                                <Icon name="chart" className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alert for low stock */}
                {stats.lowStockItems > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <Icon name="alert" className="w-5 h-5 text-amber-600" />
                            <p className="text-sm font-medium text-amber-800">
                                {stats.lowStockItems} item(s) are running low on stock and need to be reordered.
                            </p>
                        </div>
                    </div>
                )}

                {/* Search and Filter */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search parts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 w-64"
                            />
                        </div>
                    </div>
                </div>

                {/* Inventory Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Part Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Part Number</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Quantity</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Min Level</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Part Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredParts.map((part) => (
                                    <tr key={part.Inventory_id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-gray-900">{part.part_name}</p>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{part.part_number || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{part.category || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            <span className={part.quantity <= part.min_stock_level ? 'text-red-600 font-medium' : ''}>
                                                {part.quantity}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{part.min_stock_level}</td>
                                        <td className="px-4 py-3">
                                            <StatusBadge part_status={
                                                part.quantity === 0 ? 'out_of_stock' :
                                                part.quantity <= part.min_stock_level ? 'low_stock' :
                                                'available_stock'
                                            } />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <button 
                                                    onClick={() => handleEditPart(part)}
                                                    className="p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                                    title="Edit Part"
                                                >
                                                    <Icon name="edit" className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeletePart(part.Inventory_id)}
                                                    className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                                    title="Delete Part"
                                                >
                                                    <Icon name="trash" className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Part Modal */}
                <Modal isOpen={showPartModal} onClose={() => setShowPartModal(false)} title={editingPart ? 'Edit Part' : 'Add New Part'} size="md">
                    <form onSubmit={handleSavePart} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Part Name *</label>
                                <input
                                    type="text"
                                    value={partForm.part_name}
                                    onChange={(e) => setPartForm({ ...partForm, part_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                                    required
                                />
                                {errors.part_name && <p className="text-red-500 text-xs mt-1">{errors.part_name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Part Number</label>
                                <input
                                    type="text"
                                    value={partForm.part_number}
                                    onChange={(e) => setPartForm({ ...partForm, part_number: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                                />
                            </div>
                        </div>


                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <input
                                    type="text"
                                    value={partForm.category}
                                    onChange={(e) => setPartForm({ ...partForm, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                                />
                            </div>

                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                                <input
                                    type="number"
                                    value={partForm.quantity}
                                    onChange={(e) => setPartForm({ ...partForm, quantity: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                                    required
                                    min="0"
                                />
                                {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock Level *</label>
                                <input
                                    type="number"
                                    value={partForm.min_stock_level}
                                    onChange={(e) => setPartForm({ ...partForm, min_stock_level: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                                    required
                                    min="0"
                                />
                            </div>

                        </div>


                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowPartModal(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors text-sm font-medium disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : (editingPart ? 'Update Part' : 'Add Part')}
                            </button>
                        </div>
                    </form>
                </Modal>
            </div>
        </OfficeStaffLayout>
    );
}
