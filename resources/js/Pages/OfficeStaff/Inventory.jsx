import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import OfficeStaffLayout from '../../Layouts/OfficeStaffLayout';
import { 
    PackageSearch, 
    AlertCircle, 
    BarChart3, 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    X, 
    AlertTriangle 
} from 'lucide-react';

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
        <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
                
                <div className={`relative w-full ${sizeClasses[size]} bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 transform transition-all`}>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-slate-900">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" strokeWidth={2} />
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
            
            <div className="max-w-7xl mx-auto pb-12">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Inventory Management</h1>
                        <p className="text-slate-500 font-medium">Manage parts, supplies, and inventory levels</p>
                    </div>
                    <button 
                        onClick={handleAddPart}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold text-sm rounded-xl hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5"
                    >
                        <Plus className="w-5 h-5" strokeWidth={2.5} />
                        Add New Part
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-300" />
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 text-indigo-500 shadow-sm">
                                <PackageSearch className="w-6 h-6" strokeWidth={1.5} />
                            </div>
                        </div>
                        <p className="text-sm font-semibold text-slate-500 mb-1">Total Parts</p>
                        <p className="text-3xl font-black text-slate-800 tracking-tight">{stats.totalParts}</p>
                    </div>

                    <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-300" />
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 text-amber-500 shadow-sm">
                                <AlertCircle className="w-6 h-6" strokeWidth={1.5} />
                            </div>
                        </div>
                        <p className="text-sm font-semibold text-slate-500 mb-1">Low Stock Items</p>
                        <p className="text-3xl font-black text-amber-600 tracking-tight">{stats.lowStockItems}</p>
                    </div>

                    <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-500 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-300" />
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 text-rose-500 shadow-sm">
                                <AlertTriangle className="w-6 h-6" strokeWidth={1.5} />
                            </div>
                        </div>
                        <p className="text-sm font-semibold text-slate-500 mb-1">Out of Stock</p>
                        <p className="text-3xl font-black text-rose-600 tracking-tight">{stats.outOfStockItems}</p>
                    </div>

                    <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-300" />
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 text-emerald-500 shadow-sm">
                                <BarChart3 className="w-6 h-6" strokeWidth={1.5} />
                            </div>
                        </div>
                        <p className="text-sm font-semibold text-slate-500 mb-1">Total Value</p>
                        <p className="text-3xl font-black text-slate-800 tracking-tight">N/A</p>
                    </div>
                </div>

                {/* Alert for low stock */}
                {stats.lowStockItems > 0 && (
                    <div className="mb-8 p-4 rounded-2xl bg-amber-50/50 backdrop-blur-xl border border-amber-200/50 text-amber-800 shadow-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                        <AlertTriangle className="w-6 h-6 text-amber-500" />
                        <p className="font-semibold">
                            {stats.lowStockItems} item(s) are running low on stock and need to be reordered.
                        </p>
                    </div>
                )}

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search parts by name or number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-md border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm placeholder:text-slate-400 transition-all"
                        />
                    </div>
                </div>

                {/* Inventory Table */}
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50/50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-5">Part Details</th>
                                    <th className="px-6 py-5">Category</th>
                                    <th className="px-6 py-5">Stock Level</th>
                                    <th className="px-6 py-5">Min Level</th>
                                    <th className="px-6 py-5">Status</th>
                                    <th className="px-6 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/50">
                                {filteredParts.map((part) => (
                                    <tr key={part.Inventory_id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-900 text-base">{part.part_name}</p>
                                            <p className="text-xs text-slate-500 font-medium mt-0.5">#{part.part_number || 'N/A'}</p>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-700">{part.category || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`font-black text-lg ${part.quantity <= part.min_stock_level ? 'text-rose-600' : 'text-slate-800'}`}>
                                                {part.quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-500">{part.min_stock_level}</td>
                                        <td className="px-6 py-4">
                                            <StatusBadge part_status={
                                                part.quantity === 0 ? 'out_of_stock' :
                                                part.quantity <= part.min_stock_level ? 'low_stock' :
                                                'available_stock'
                                            } />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleEditPart(part)}
                                                    className="p-2.5 text-indigo-400 bg-indigo-50 hover:bg-indigo-500 hover:text-white rounded-xl transition-all shadow-sm"
                                                    title="Edit Part"
                                                >
                                                    <Edit2 className="w-4 h-4" strokeWidth={2.5} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeletePart(part.Inventory_id)}
                                                    className="p-2.5 text-rose-400 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm"
                                                    title="Delete Part"
                                                >
                                                    <Trash2 className="w-4 h-4" strokeWidth={2.5} />
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


                        <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setShowPartModal(false)}
                                className="px-6 py-3 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors text-sm font-bold w-full md:w-auto"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-600 transition-all text-sm font-bold w-full md:w-auto disabled:opacity-50 shadow-lg shadow-indigo-500/25"
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
