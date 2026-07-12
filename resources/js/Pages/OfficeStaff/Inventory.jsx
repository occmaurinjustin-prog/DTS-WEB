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
    AlertTriangle,
    History 
} from 'lucide-react';

// Status Badge Component
function StatusBadge({ part_status }) {
    const styles = {
        pending: 'bg-zinc-100 text-zinc-700 border-zinc-200',
        ongoing: 'bg-amber-50 text-amber-700 border-amber-200',
        completed: 'bg-green-50 text-green-700 border-green-200',
        cancelled: 'bg-red-50 text-red-700 border-red-200',
        available: 'bg-green-50 text-green-700 border-green-200',
        in_use: 'bg-blue-50 text-blue-700 border-blue-200',
        maintenance: 'bg-amber-50 text-amber-700 border-amber-200',
        inactive: 'bg-zinc-100 text-zinc-700 border-zinc-200',
        low: 'bg-zinc-100 text-zinc-700 border-zinc-200',
        medium: 'bg-amber-50 text-amber-700 border-amber-200',
        high: 'bg-orange-50 text-orange-700 border-orange-200',
        critical: 'bg-red-50 text-red-700 border-red-200',
        available_stock: 'bg-green-50 text-green-700 border-green-200',
        low_stock: 'bg-amber-50 text-amber-700 border-amber-200',
        out_of_stock: 'bg-red-50 text-red-700 border-red-200',
    };

    const labels = {
        in_use: 'In Use',
        low_stock: 'Low Stock',
        out_of_stock: 'Out of Stock',
    };

    return (
        <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${styles[part_status] || styles.pending}`}>
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
                <div className="fixed inset-0 bg-black/40 transition-opacity" onClick={onClose} />
                
                <div className={`relative w-full ${sizeClasses[size]} bg-white border border-zinc-200 shadow-xl`}>
                    <div className="flex items-center justify-between p-6 border-b border-zinc-200">
                        <h2 className="text-lg font-bold text-zinc-900 tracking-tight">{title}</h2>
                        <button
                            onClick={onClose}
                            className="text-zinc-400 hover:text-zinc-600 transition-colors"
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
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showMasterLedgerModal, setShowMasterLedgerModal] = useState(false);
    const [editingPart, setEditingPart] = useState(null);
    const [selectedPartHistory, setSelectedPartHistory] = useState([]);
    const [masterLedger, setMasterLedger] = useState([]);
    const [ledgerSearchTerm, setLedgerSearchTerm] = useState('');
    const [ledgerTypeFilter, setLedgerTypeFilter] = useState('all');
    const [ledgerStartDate, setLedgerStartDate] = useState('');
    const [ledgerEndDate, setLedgerEndDate] = useState('');
    const [errors, setErrors] = useState({});
    
    const [partForm, setPartForm] = useState({
        part_name: '',
        category: '',
        quantity: 0,
        min_stock_level: 5,
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
        part.part_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddPart = () => {
        setEditingPart(null);
        setPartForm({
            part_name: '',
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
            part_name: part.part_name || '',
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

    const handleViewHistory = async (part) => {
        setEditingPart(part);
        setSelectedPartHistory([]);
        setShowHistoryModal(true);
        try {
            const response = await fetch(`/office-staff/maintenance/inventory/${part.Inventory_id}/transactions`);
            const data = await response.json();
            setSelectedPartHistory(data.transactions || []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    const handleViewMasterLedger = async () => {
        setMasterLedger([]);
        setShowMasterLedgerModal(true);
        try {
            const response = await fetch(`/office-staff/maintenance/inventory/transactions`);
            const data = await response.json();
            setMasterLedger(data.transactions || []);
        } catch (error) {
            console.error('Error fetching master ledger:', error);
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
            
            <div className="max-w-7xl pb-12">
                {/* Header Actions & Search */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <div className="relative w-full lg:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search parts by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 text-sm focus:ring-0 focus:border-zinc-500 transition-colors"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={handleViewMasterLedger}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-zinc-700 text-xs font-semibold uppercase tracking-widest border border-zinc-200 hover:bg-zinc-50 transition-colors"
                        >
                            <History className="w-4 h-4" />
                            Master Ledger
                        </button>
                        <button 
                            onClick={handleAddPart}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-xs font-semibold uppercase tracking-widest border border-zinc-900 hover:bg-zinc-800 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add New Part
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white border border-zinc-200 p-4">
                        <div className="flex items-center justify-between mb-1">
                            <div className="text-zinc-500">
                                <PackageSearch className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-zinc-900">{stats.totalParts}</div>
                        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Total Parts</div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-4">
                        <div className="flex items-center justify-between mb-1">
                            <div className="text-amber-500">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-amber-700">{stats.lowStockItems}</div>
                        <div className="text-[10px] font-semibold text-amber-600 uppercase tracking-widest">Low Stock Items</div>
                    </div>

                    <div className="bg-red-50 border border-red-200 p-4">
                        <div className="flex items-center justify-between mb-1">
                            <div className="text-red-500">
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-red-700">{stats.outOfStockItems}</div>
                        <div className="text-[10px] font-semibold text-red-600 uppercase tracking-widest">Out of Stock</div>
                    </div>

                    <div className="bg-white border border-zinc-200 p-4">
                        <div className="flex items-center justify-between mb-1">
                            <div className="text-emerald-500">
                                <BarChart3 className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-zinc-900">N/A</div>
                        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Total Value</div>
                    </div>
                </div>

                {/* Alert for low stock */}
                {stats.lowStockItems > 0 && (
                    <div className="mb-8 p-4 bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <p className="font-semibold text-sm">
                            {stats.lowStockItems} item(s) are running low on stock and need to be reordered.
                        </p>
                    </div>
                )}



                {/* Inventory Table */}
                <div className="bg-white border border-zinc-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-zinc-50 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider border-b border-zinc-200">
                                <tr>
                                    <th className="px-6 py-4">Part Name</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Stock Level</th>
                                    <th className="px-6 py-4">Min Level</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {filteredParts.map((part) => (
                                    <tr key={part.Inventory_id} className="hover:bg-zinc-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-zinc-900">{part.part_name}</p>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-zinc-600">{part.category || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`font-black text-lg ${part.quantity <= part.min_stock_level ? 'text-red-600' : 'text-zinc-900'}`}>
                                                {part.quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-zinc-500">{part.min_stock_level}</td>
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
                                                    onClick={() => handleViewHistory(part)}
                                                    className="px-3 py-1 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-600 text-[10px] font-bold uppercase tracking-widest transition-colors"
                                                    title="View History"
                                                >
                                                    History
                                                </button>
                                                <button 
                                                    onClick={() => handleEditPart(part)}
                                                    className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-900 text-[10px] font-bold uppercase tracking-widest transition-colors"
                                                    title="Edit Part"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDeletePart(part.Inventory_id)}
                                                    className="px-3 py-1 bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-widest transition-colors"
                                                    title="Delete Part"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {filteredParts.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-xs font-semibold uppercase tracking-widest text-zinc-400">No parts found</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Part Modal */}
                <Modal isOpen={showPartModal} onClose={() => setShowPartModal(false)} title={editingPart ? 'Edit Part' : 'Add New Part'} size="md">
                    <form onSubmit={handleSavePart}>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Part Name *</label>
                                <input
                                    type="text"
                                    value={partForm.part_name}
                                    onChange={(e) => setPartForm({ ...partForm, part_name: e.target.value })}
                                    className="w-full px-4 py-2 border border-zinc-200 focus:ring-0 focus:border-zinc-500 font-medium text-zinc-900 transition-colors"
                                    required
                                />
                                {errors.part_name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.part_name}</p>}
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Category</label>
                                <input
                                    type="text"
                                    value={partForm.category}
                                    onChange={(e) => setPartForm({ ...partForm, category: e.target.value })}
                                    className="w-full px-4 py-2 border border-zinc-200 focus:ring-0 focus:border-zinc-500 font-medium text-zinc-900 transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Quantity *</label>
                                    <input
                                        type="number"
                                        value={partForm.quantity}
                                        onChange={(e) => setPartForm({ ...partForm, quantity: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 border border-zinc-200 focus:ring-0 focus:border-zinc-500 font-medium text-zinc-900 transition-colors"
                                        required
                                        min="0"
                                    />
                                    {errors.quantity && <p className="text-red-500 text-xs mt-1 font-medium">{errors.quantity}</p>}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Min Stock Level *</label>
                                    <input
                                        type="number"
                                        value={partForm.min_stock_level}
                                        onChange={(e) => setPartForm({ ...partForm, min_stock_level: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 border border-zinc-200 focus:ring-0 focus:border-zinc-500 font-medium text-zinc-900 transition-colors"
                                        required
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-zinc-200 px-6 py-4 bg-zinc-50 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowPartModal(false)}
                                className="px-5 py-2 text-xs font-semibold uppercase tracking-widest text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-5 py-2 text-xs font-semibold uppercase tracking-widest text-white bg-zinc-900 hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Saving...' : (editingPart ? 'Update Part' : 'Add Part')}
                            </button>
                        </div>
                    </form>
                </Modal>

                {/* History Modal */}
                <Modal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} title={`Stock Ledger: ${editingPart?.part_name}`} size="md">
                    <div className="max-h-[60vh] overflow-y-auto p-6 bg-zinc-50">
                        {selectedPartHistory.length === 0 ? (
                            <div className="text-center py-8 text-zinc-500">
                                <History className="w-10 h-10 mx-auto mb-3 text-zinc-300" />
                                <p className="text-xs font-semibold uppercase tracking-widest">No transaction history found</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {selectedPartHistory.map((txn) => (
                                    <div key={txn.id} className="bg-white p-4 border border-zinc-200 flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${txn.type === 'stock_in' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                    {txn.type === 'stock_in' ? 'STOCK IN' : 'STOCK OUT'}
                                                </span>
                                                <span className="text-xs font-semibold text-zinc-700">
                                                    Qty: <span className="font-bold">{txn.quantity}</span>
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-500 font-medium">
                                                By: {txn.user?.firstname} {txn.user?.lastname}
                                            </p>
                                            <p className="text-sm text-zinc-900 font-medium mt-1">{txn.remarks}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{new Date(txn.created_at).toLocaleString()}</p>
                                            <p className="text-[10px] text-zinc-400 mt-1 font-semibold">{txn.reference_type ? `Ref: ${txn.reference_type} #${txn.reference_id}` : ''}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Modal>

                {/* Master Ledger Modal */}
                <Modal isOpen={showMasterLedgerModal} onClose={() => setShowMasterLedgerModal(false)} title="Master Stock Ledger" size="lg">
                    <div className="p-6 border-b border-zinc-200 bg-white">
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-4">
                                <div className="relative flex-1">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by part name or remarks..."
                                        value={ledgerSearchTerm}
                                        onChange={(e) => setLedgerSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-zinc-200 focus:ring-0 focus:border-zinc-500 text-sm font-medium transition-colors"
                                    />
                                </div>
                                <select
                                    value={ledgerTypeFilter}
                                    onChange={(e) => setLedgerTypeFilter(e.target.value)}
                                    className="px-4 py-2 border border-zinc-200 focus:ring-0 focus:border-zinc-500 text-sm font-medium bg-white min-w-[140px] transition-colors"
                                >
                                    <option value="all">All Types</option>
                                    <option value="stock_in">Stock In</option>
                                    <option value="stock_out">Stock Out</option>
                                </select>
                            </div>
                            <div className="flex gap-4 items-center">
                                <div className="flex-1 flex items-center gap-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 whitespace-nowrap">From:</label>
                                    <input
                                        type="date"
                                        value={ledgerStartDate}
                                        onChange={(e) => setLedgerStartDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-zinc-200 focus:ring-0 focus:border-zinc-500 text-sm font-medium transition-colors"
                                    />
                                </div>
                                <div className="flex-1 flex items-center gap-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 whitespace-nowrap">To:</label>
                                    <input
                                        type="date"
                                        value={ledgerEndDate}
                                        onChange={(e) => setLedgerEndDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-zinc-200 focus:ring-0 focus:border-zinc-500 text-sm font-medium transition-colors"
                                    />
                                </div>
                                <button 
                                    onClick={() => { setLedgerStartDate(''); setLedgerEndDate(''); setLedgerSearchTerm(''); setLedgerTypeFilter('all'); }}
                                    className="px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-[10px] font-bold uppercase tracking-widest transition-colors"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto p-6 bg-zinc-50">
                        {masterLedger.length === 0 ? (
                            <div className="text-center py-8 text-zinc-500">
                                <History className="w-10 h-10 mx-auto mb-3 text-zinc-300" />
                                <p className="text-xs font-semibold uppercase tracking-widest">No transaction history found</p>
                            </div>
                        ) : (() => {
                            const filteredLedger = masterLedger.filter(txn => {
                                const matchesSearch = (txn.inventory?.part_name || '').toLowerCase().includes(ledgerSearchTerm.toLowerCase()) || 
                                                      (txn.remarks || '').toLowerCase().includes(ledgerSearchTerm.toLowerCase());
                                const matchesType = ledgerTypeFilter === 'all' || txn.type === ledgerTypeFilter;
                                
                                let matchesDate = true;
                                if (ledgerStartDate || ledgerEndDate) {
                                    const txnDate = new Date(txn.created_at);
                                    // Reset time portion for accurate day comparison
                                    txnDate.setHours(0, 0, 0, 0);
                                    
                                    if (ledgerStartDate) {
                                        const start = new Date(ledgerStartDate);
                                        start.setHours(0, 0, 0, 0);
                                        if (txnDate < start) matchesDate = false;
                                    }
                                    
                                    if (ledgerEndDate) {
                                        const end = new Date(ledgerEndDate);
                                        end.setHours(23, 59, 59, 999); // end of day
                                        // use the original created_at for end date comparison to be precise
                                        const txnDateTime = new Date(txn.created_at);
                                        if (txnDateTime > end) matchesDate = false;
                                    }
                                }
                                
                                return matchesSearch && matchesType && matchesDate;
                            });

                            if (filteredLedger.length === 0) {
                                return (
                                    <div className="text-center py-8 text-zinc-500">
                                        <p className="text-xs font-semibold uppercase tracking-widest">No results match your filter</p>
                                    </div>
                                );
                            }

                            return (
                                <div className="space-y-3">
                                    {filteredLedger.map((txn) => (
                                        <div key={txn.id} className="bg-white p-4 border border-zinc-200 flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${txn.type === 'stock_in' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                        {txn.type === 'stock_in' ? 'STOCK IN' : 'STOCK OUT'}
                                                    </span>
                                                    <span className="text-xs font-semibold text-zinc-700">
                                                        Part: <span className="font-bold text-zinc-900">{txn.inventory?.part_name}</span> (Qty: {txn.quantity})
                                                    </span>
                                                </div>
                                                <p className="text-xs text-zinc-500 font-medium">
                                                    By: {txn.user?.firstname} {txn.user?.lastname}
                                                </p>
                                                <p className="text-sm text-zinc-900 font-medium mt-1">{txn.remarks}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{new Date(txn.created_at).toLocaleString()}</p>
                                                <p className="text-[10px] text-zinc-400 mt-1 font-semibold">{txn.reference_type ? `Ref: ${txn.reference_type} #${txn.reference_id}` : ''}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                </Modal>
            </div>
        </OfficeStaffLayout>
    );
}
