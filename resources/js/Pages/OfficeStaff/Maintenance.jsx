import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import OfficeStaffLayout from '../../Layouts/OfficeStaffLayout';
import { 
    LayoutDashboard, Package, BarChart3, Plus, Search, Filter, 
    Edit2, Trash2, X, Check, AlertCircle, User, ArrowRight, ArrowLeft, 
    Download, Upload, Calendar, Clock, MapPin, Wrench, Minus, PlusCircle 
} from 'lucide-react';

const iconMap = {
    dashboard: LayoutDashboard,
    package: Package,
    chart: BarChart3,
    plus: Plus,
    search: Search,
    filter: Filter,
    edit: Edit2,
    trash: Trash2,
    close: X,
    check: Check,
    alert: AlertCircle,
    user: User,
    arrowRight: ArrowRight,
    arrowLeft: ArrowLeft,
    download: Download,
    upload: Upload,
    calendar: Calendar,
    clock: Clock,
    location: MapPin,
    wrench: Wrench,
    minus: Minus,
    plusCircle: PlusCircle
};

function Icon({ name, className = 'w-5 h-5' }) {
    const LucideIcon = iconMap[name];
    if (!LucideIcon) return null;
    return <LucideIcon className={className} strokeWidth={2} />;
}

// Status Badge Component
function StatusBadge({ status }) {
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
        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${styles[status] || styles.pending} shadow-sm`}>
            {labels[status] || status?.replace('_', ' ')}
        </span>
    );
}

// Workflow Modal Component
function WorkflowModal({ isOpen, onClose, report, authUser, mechanics = [] }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [inventory, setInventory] = useState([]);
    const [selectedParts, setSelectedParts] = useState([]);
    
    // Form data for each step
    const [scheduleData, setScheduleData] = useState({
        repair_date: '',
        repair_time: '',
        repair_location: '',
        assign_mechanics: ''
    });
    const [errorMessage, setErrorMessage] = useState(null);

    const steps = [
        { id: 1, name: 'Report', icon: 'dashboard' },
        { id: 2, name: 'Parts', icon: 'package' },
        { id: 3, name: 'Schedule', icon: 'calendar' },
        { id: 4, name: 'Review', icon: 'check' }
    ];

    // Fetch inventory data when opening parts selection
    useEffect(() => {
        if (currentStep === 2) {
            console.log('Fetching inventory parts...');
            fetch('/office-staff/maintenance/inventory')
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    console.log('Inventory data received:', data);
                    setInventory(data.parts || []);
                })
                .catch(error => {
                    console.error('Error fetching inventory:', error);
                    setInventory([]); // Set empty array on error
                });
        }
    }, [currentStep]);

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handlePartSelection = (part, quantity) => {
        const existingIndex = selectedParts.findIndex(p => p.Inventory_id === part.Inventory_id);
        
        if (existingIndex >= 0) {
            if (quantity > 0) {
                const updated = [...selectedParts];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity_needed: quantity
                };
                setSelectedParts(updated);
            } else {
                setSelectedParts(selectedParts.filter(p => p.Inventory_id !== part.Inventory_id));
            }
        } else if (quantity > 0) {
            setSelectedParts([...selectedParts, {
                ...part,
                quantity_needed: quantity
            }]);
        }
    };

    const getSelectedPartsCount = () => selectedParts.reduce((sum, part) => sum + part.quantity_needed, 0);

    const handleConfirm = () => {
        if (!report?.id) {
            setErrorMessage('ERROR: No report ID found!');
            return;
        }
        
        if (!scheduleData?.repair_date || !scheduleData?.repair_time || !scheduleData?.repair_location) {
            setErrorMessage('ERROR: Please fill in all schedule fields!');
            return;
        }
        
        setLoading(true);
        setErrorMessage(null);
        
        const workflowData = {
            report_id: report.id,
            selected_parts: selectedParts,
            schedule: scheduleData
        };
        
        router.post('/office-staff/maintenance/process-workflow', workflowData, {
            onSuccess: () => {
                setLoading(false);
                onClose();
                window.location.reload();
            },
            onError: (errors) => {
                setLoading(false);
                const firstError = Object.values(errors)[0];
                setErrorMessage(typeof firstError === 'string' ? firstError : 'Failed to process workflow. Please try again.');
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={onClose} />
                
                <div className="relative w-full max-w-4xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 overflow-hidden">
                    {/* Progress Stepper */}
                    <div className="border-b border-slate-200/50 bg-white/50 px-6 py-7">
                        <div className="flex items-center justify-between">
                            {steps.map((step, index) => (
                                <div key={step.id} className="flex items-center">
                                    <div className="flex items-center">
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 shadow-sm ${
                                            currentStep >= step.id 
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-200' 
                                                : 'bg-white border-slate-200 text-slate-400'
                                        }`}>
                                            <Icon name={step.icon} className="w-5 h-5" />
                                        </div>
                                        <span className={`ml-3 text-sm font-bold tracking-wide ${
                                            currentStep >= step.id ? 'text-indigo-700' : 'text-slate-400'
                                        }`}>
                                            {step.name}
                                        </span>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`w-16 h-1 mx-4 rounded-full transition-all duration-300 ${
                                            currentStep > step.id ? 'bg-indigo-600' : 'bg-slate-200'
                                        }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Error Message */}
                    {errorMessage && (
                        <div className="px-6 pt-4">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                    <Icon name="alert" className="w-5 h-5 text-red-600" />
                                    <p className="text-sm text-red-700">{errorMessage}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step Content */}
                    <div className="px-6 py-4 max-h-[65vh] overflow-y-auto">
                        {currentStep === 1 && <Step1ReportDetails report={report} />}
                        {currentStep === 2 && (
                            <Step2PartsSelection 
                                inventory={inventory} 
                                selectedParts={selectedParts}
                                onPartSelection={handlePartSelection}
                            />
                        )}
                        {currentStep === 3 && (
                            <Step3Scheduling 
                                scheduleData={scheduleData}
                                setScheduleData={setScheduleData}
                                mechanics={mechanics}
                            />
                        )}
                        {currentStep === 4 && (
                            <Step4Review 
                                report={report}
                                selectedParts={selectedParts}
                                scheduleData={scheduleData}
                                mechanics={mechanics}
                            />
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="border-t border-slate-200/50 px-6 py-4 bg-slate-50/50 backdrop-blur-md">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {currentStep > 1 && (
                                    <button
                                        onClick={handlePrevious}
                                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                                    >
                                        <Icon name="arrowLeft" className="w-4 h-4" />
                                        Previous
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                            
                            {currentStep < 4 ? (
                                <button
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
                                >
                                    Next Step
                                    <Icon name="arrowRight" className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleConfirm}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200 disabled:opacity-50"
                                >
                                    <Icon name="check" className="w-4 h-4" />
                                    {loading ? 'Processing...' : 'Confirm Maintenance'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// View Modal Component (Read-only for completed reports)
function ViewModal({ isOpen, onClose, report }) {
    if (!isOpen || !report) return null;

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'critical': return 'text-red-600 bg-red-50 border-red-200';
            case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'low': return 'text-green-600 bg-green-50 border-green-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={onClose} />
                
                <div className="relative w-full max-w-3xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 overflow-hidden">
                    {/* Header */}
                    <div className="border-b border-slate-200/50 bg-white/50 px-6 py-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Maintenance Record</h2>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                                <Icon name="close" className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
                        {/* Status Badge */}
                        <div className="mb-6 flex items-center justify-between">
                            <span className={`inline-flex px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg border shadow-sm ${getStatusColor(report.status)}`}>
                                {report.status?.replace('_', ' ')}
                            </span>
                        </div>

                        {/* Report Details */}
                        <div className="bg-white rounded-2xl p-5 mb-6 border border-slate-100 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Report Details</h3>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Report ID</label>
                                    <p className="text-base font-black text-slate-900 mt-1">#{report.id}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Driver</label>
                                    <p className="text-base font-bold text-slate-900 mt-1">
                                        {report.driver?.user?.first_name && report.driver?.user?.last_name 
                                            ? `${report.driver.user.first_name} ${report.driver.user.last_name}`
                                            : report.driver?.user?.name || `DRV-${report.driver_id}`
                                        }
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Vehicle Type</label>
                                    <p className="text-base font-bold text-slate-900 mt-1">{report.truck?.vehicle_type || 'Unknown'}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</label>
                                    <div className="mt-1">
                                        <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getPriorityColor(report.priority_level)}`}>
                                            {report.priority_level}
                                        </span>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Issue</label>
                                    <p className="text-base font-bold text-slate-900">{report.issue_title}</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                                    <p className="text-sm font-medium text-slate-600 bg-slate-50 rounded-xl p-4 border border-slate-100">
                                        {report.issue_description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Maintenance Schedule */}
                        {report.maintenance && (
                            <div className="bg-indigo-50 rounded-2xl p-5 mb-6 border border-indigo-100 shadow-sm">
                                <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-4 flex items-center">
                                    <Icon name="calendar" className="w-4 h-4 inline mr-2" />
                                    Scheduled Maintenance
                                </h3>
                                <div className="grid grid-cols-3 gap-5">
                                    <div>
                                        <label className="block text-xs font-semibold text-indigo-400 uppercase tracking-wider">Date</label>
                                        <p className="text-base font-bold text-indigo-950 mt-1">
                                            {report.maintenance.repair_date}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-indigo-400 uppercase tracking-wider">Time</label>
                                        <p className="text-base font-bold text-indigo-950 mt-1">
                                            {report.maintenance.repair_time}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-indigo-400 uppercase tracking-wider">Location</label>
                                        <p className="text-base font-bold text-indigo-950 mt-1">
                                            {report.maintenance.repair_location}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Completion Info */}
                        {report.completed_at && (
                            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 shadow-sm">
                                <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wider mb-4 flex items-center">
                                    <Icon name="check" className="w-4 h-4 inline mr-2" />
                                    Completion Information
                                </h3>
                                <div>
                                    <label className="block text-xs font-semibold text-emerald-500 uppercase tracking-wider">Completed On</label>
                                    <p className="text-base font-bold text-emerald-950 mt-1">
                                        {new Date(report.completed_at).toLocaleDateString('en-US', { 
                                            month: 'long', day: 'numeric', year: 'numeric' 
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-200/50 px-6 py-4 bg-slate-50/50 backdrop-blur-md flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Step 1: Report Details
function Step1ReportDetails({ report }) {
    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'critical':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'high':
                return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'medium':
                return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'low':
                return 'text-green-600 bg-green-50 border-green-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Maintenance Report Details</h2>
                <p className="text-slate-500 font-medium">Review the submitted maintenance report information</p>
            </div>
            
            <div className="bg-white/50 backdrop-blur-md border border-white/40 shadow-sm rounded-2xl p-5">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Driver</label>
                        <p className="text-lg font-medium text-gray-900">
                            {report.driver?.user?.first_name && report.driver?.user?.last_name 
                                ? `${report.driver.user.first_name} ${report.driver.user.last_name}`
                                : report.driver?.user?.name || `DRV-${report.driver_id}`
                            }
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Vehicle Type</label>
                        <p className="text-lg font-medium text-gray-900">{report.truck?.vehicle_type || 'Unknown'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Priority</label>
                        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getPriorityColor(report.priority_level)}`}>
                            {report.priority_level || 'Medium'}
                        </span>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Date Submitted</label>
                        <p className="text-lg font-medium text-gray-900">
                            {new Date(report.created_at).toLocaleDateString('en-US', { 
                                month: 'long', 
                                day: 'numeric', 
                                year: 'numeric' 
                            })}
                        </p>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-500 mb-1">Issue Title</label>
                        <p className="text-lg font-medium text-gray-900">{report.issue_title || 'No title'}</p>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-500 mb-1">Issue Description</label>
                        <p className="text-gray-700 bg-gray-50 rounded-lg p-3">{report.issue_description || 'No description'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Current Status</label>
                        <StatusBadge status={report.status} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Step 2: Parts Selection
function Step2PartsSelection({ inventory, selectedParts, onPartSelection }) {
    const [quantities, setQuantities] = useState({});

    const getSelectedPartsCount = () => selectedParts.reduce((sum, part) => sum + part.quantity_needed, 0);

    const handleQuantityChange = (partId, quantity) => {
        setQuantities({ ...quantities, [partId]: quantity });
        const part = inventory.find(p => p.Inventory_id === partId);
        if (part) {
            onPartSelection(part, parseInt(quantity) || 0);
        }
    };

    console.log('Step2 - Inventory:', inventory);
    console.log('Step2 - Inventory length:', inventory.length);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Select Parts From Inventory</h2>
                <p className="text-slate-500 font-medium">Choose the parts needed for this maintenance job</p>
            </div>
            
            <div className="grid grid-cols-3 gap-5">
                {/* Parts Table */}
                <div className="col-span-2">
                    <div className="bg-white/50 backdrop-blur-md border border-white/40 shadow-sm rounded-2xl overflow-hidden">
                        <div className="max-h-80 overflow-y-auto">
                            {inventory.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="text-gray-500">No parts available in inventory</div>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Part Name</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stock</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Quantity</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {inventory.map((part) => {
                                            const isLowStock = part.quantity <= part.min_stock_level;
                                            const selectedQuantity = quantities[part.Inventory_id] || 0;
                                            
                                            return (
                                                <tr key={part.Inventory_id} className={`hover:bg-gray-50 ${isLowStock ? 'bg-amber-50' : ''}`}>
                                                    <td className="px-4 py-3">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{part.part_name}</p>
                                                            {isLowStock && (
                                                                <span className="text-xs text-amber-600 font-medium">Low Stock</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`text-sm font-medium ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                                                            {part.quantity} {part.unit}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleQuantityChange(part.Inventory_id, Math.max(0, (selectedQuantity || 0) - 1))}
                                                                disabled={selectedQuantity <= 0}
                                                                className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                <Icon name="minus" className="w-4 h-4" />
                                                            </button>
                                                            <span className="w-12 text-center font-medium text-gray-900">
                                                                {selectedQuantity || 0}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleQuantityChange(part.Inventory_id, Math.min(part.quantity, (selectedQuantity || 0) + 1))}
                                                                disabled={selectedQuantity >= part.quantity}
                                                                className="w-8 h-8 flex items-center justify-center bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                <Icon name="plus" className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                {/* Summary Card */}
                <div className="col-span-1">
                    <div className="bg-white/50 backdrop-blur-md border border-white/40 shadow-sm rounded-2xl p-5 sticky top-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Selected Parts Summary</h3>
                        
                        <div className="space-y-3">
                            {selectedParts.length > 0 ? (
                                <>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Parts</h4>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {selectedParts.map((part) => (
                                            <div key={part.Inventory_id} className="bg-gray-50 rounded-lg p-2">
                                                <div className="flex items-center">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{part.part_name}</p>
                                                        <p className="text-xs text-gray-500">Qty: {part.quantity_needed} {part.unit}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Icon name="package" className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-500">No parts selected</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Step 3: Scheduling
function Step3Scheduling({ scheduleData, setScheduleData, mechanics = [] }) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Maintenance Scheduling</h2>
                <p className="text-slate-500 font-medium">Set up the repair schedule</p>
            </div>
            
            <div className="bg-white/50 backdrop-blur-md border border-white/40 shadow-sm rounded-2xl p-5">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Icon name="calendar" className="w-4 h-4 inline mr-2" />
                            Repair Date *
                        </label>
                        <input
                            type="date"
                            value={scheduleData.repair_date}
                            onChange={(e) => setScheduleData({ ...scheduleData, repair_date: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Icon name="clock" className="w-4 h-4 inline mr-2" />
                            Repair Time *
                        </label>
                        <input
                            type="time"
                            value={scheduleData.repair_time}
                            onChange={(e) => setScheduleData({ ...scheduleData, repair_time: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Icon name="location" className="w-4 h-4 inline mr-2" />
                            Repair Location *
                        </label>
                        <input
                            type="text"
                            value={scheduleData.repair_location}
                            onChange={(e) => setScheduleData({ ...scheduleData, repair_location: e.target.value })}
                            placeholder="e.g., Main Garage, Workshop Bay 3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Icon name="user" className="w-4 h-4 inline mr-2" />
                            Assign Mechanic *
                        </label>
                        <select
                            value={scheduleData.assign_mechanics}
                            onChange={(e) => setScheduleData({ ...scheduleData, assign_mechanics: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            required
                        >
                            <option value="">Select a Mechanic</option>
                            {mechanics.map((mechanic) => (
                                <option key={mechanic.user_id} value={mechanic.user_id}>
                                    {mechanic.first_name && mechanic.last_name ? `${mechanic.first_name} ${mechanic.last_name}` : mechanic.username || mechanic.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                </div>
            </div>
        </div>
    );
}

// Step 4: Review & Confirm
function Step4Review({ report, selectedParts, scheduleData, mechanics = [] }) {
    const assignedMechanic = mechanics.find(m => m.user_id.toString() === scheduleData.assign_mechanics?.toString());
    const mechanicName = assignedMechanic 
        ? (assignedMechanic.first_name && assignedMechanic.last_name ? `${assignedMechanic.first_name} ${assignedMechanic.last_name}` : assignedMechanic.username || assignedMechanic.name)
        : 'Not Assigned';
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Review & Confirm</h2>
                <p className="text-slate-500 font-medium">Review all details before confirming the maintenance workflow</p>
            </div>
            
            {/* Alert Box */}
            <div className="bg-indigo-50/80 backdrop-blur-sm border border-indigo-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                    <Icon name="alert" className="w-5 h-5 text-indigo-600 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wider">Confirmation Required</h4>
                        <p className="text-sm font-medium text-indigo-700 mt-1">
                            Please review all details carefully. Once confirmed, this maintenance workflow will be processed and notifications will be sent to the assigned mechanic ({mechanicName}).
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
                {/* Report Summary */}
                <div className="bg-white/50 backdrop-blur-md border border-white/40 shadow-sm rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Maintenance Report Summary</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Report ID</span>
                            <span className="text-sm font-black text-slate-900">#{report.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Driver</span>
                            <span className="text-sm font-bold text-slate-900">
                                {report.driver?.user?.first_name && report.driver?.user?.last_name 
                                    ? `${report.driver.user.first_name} ${report.driver.user.last_name}`
                                    : report.driver?.user?.name || `DRV-${report.driver_id}`
                                }
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Vehicle Type</span>
                            <span className="text-sm font-bold text-slate-900">{report.truck?.vehicle_type || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Issue</span>
                            <span className="text-sm font-bold text-slate-900">{report.issue_title}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Priority</span>
                            <StatusBadge status={report.priority_level} />
                        </div>
                        <div className="flex justify-between border-t border-slate-200/50 pt-3 mt-1">
                            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Assigned Mechanic</span>
                            <span className="text-sm font-bold text-indigo-700">{mechanicName}</span>
                        </div>
                    </div>
                </div>
                
                {/* Parts Summary */}
                <div className="bg-white/50 backdrop-blur-md border border-white/40 shadow-sm rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Selected Parts Summary</h3>
                    <div className="space-y-3">
                        {selectedParts.length > 0 ? (
                            <>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Parts Details</h4>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {selectedParts.map((part) => (
                                        <div key={part.Inventory_id} className="py-1">
                                            <div>
                                                <p className="text-xs font-medium text-gray-900">{part.part_name}</p>
                                                <p className="text-xs text-gray-500">Qty: {part.quantity_needed} {part.unit}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-sm text-gray-500">No parts selected</p>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Schedule Details */}
                <div className="bg-white/50 backdrop-blur-md border border-white/40 shadow-sm rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Schedule Details</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Date</span>
                            <span className="text-sm font-bold text-slate-900">
                                {new Date(scheduleData.repair_date).toLocaleDateString('en-US', { 
                                    month: 'long', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                })}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Time</span>
                            <span className="text-sm font-bold text-slate-900">{scheduleData.repair_time}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Location</span>
                            <span className="text-sm font-bold text-slate-900">{scheduleData.repair_location}</span>
                        </div>
                                            </div>
                </div>
                
                {/* Final Summary */}
                <div className="bg-emerald-50/80 backdrop-blur-sm border border-emerald-200 shadow-sm rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wider mb-4">Final Summary</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Icon name="check" className="w-5 h-5 text-green-600" />
                            <span className="text-sm text-gray-700">Maintenance report reviewed and approved</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Icon name="check" className="w-5 h-5 text-green-600" />
                            <span className="text-sm text-gray-700">Parts selected from inventory</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Icon name="check" className="w-5 h-5 text-green-600" />
                            <span className="text-sm text-gray-700">Repair schedule configured</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Icon name="check" className="w-5 h-5 text-green-600" />
                            <span className="text-sm text-gray-700">Mechanic assigned to job</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const FleetManagement = ({ authUser, reports: initialReports, mechanics = [] }) => {
    const [reports, setReports] = useState(initialReports || []);
    const [loading, setLoading] = useState(false);
    const [showWorkflowModal, setShowWorkflowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [activeTab, setActiveTab] = useState('driver-reports'); // 'driver-reports' or 'mechanic-inspections'
    const [inspectionReports, setInspectionReports] = useState([]);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedInspection, setSelectedInspection] = useState(null);
    const [scheduleData, setScheduleData] = useState({
        mechanic_id: '',
        repair_date: '',
        repair_time: '',
        repair_location: '',
        parts: []
    });
    const [availableMechanics, setAvailableMechanics] = useState([]);

    // Fetch reports data
    const fetchReports = () => {
        fetch('/office-staff/maintenance/driver-reports')
            .then(res => res.json())
            .then(data => {
                setReports(data.reports || []);
            })
            .catch(error => {
                console.error('Error fetching reports:', error);
            });
    };

    // Fetch mechanic inspection reports
    const fetchInspectionReports = () => {
        fetch('/office-staff/maintenance/mechanic-inspection-reports')
            .then(res => res.json())
            .then(data => {
                setInspectionReports(data.reports || []);
            })
            .catch(error => {
                console.error('Error fetching inspection reports:', error);
            });
    };

    // Fetch available mechanics
    const fetchMechanics = () => {
        console.log('Fetching mechanics...');
        fetch('/api/mechanics')
            .then(res => {
                console.log('Mechanics response status:', res.status);
                return res.json();
            })
            .then(data => {
                console.log('Mechanics data:', data);
                if (data.success && data.mechanics) {
                    console.log('Setting available mechanics:', data.mechanics);
                    setAvailableMechanics(data.mechanics);
                } else {
                    console.log('No mechanics in response or success is false');
                }
            })
            .catch(error => {
                console.error('Error fetching mechanics:', error);
            });
    };

    useEffect(() => {
        if (!initialReports?.length) {
            fetchReports();
        }
        fetchInspectionReports();
        fetchMechanics();
    }, []);

    const handleApprove = (reportId) => {
        setLoading(true);
        router.patch(`/office-staff/maintenance/driver-reports/${reportId}/status`, 
            { status: 'approved' }, 
            {
                onSuccess: () => {
                    setLoading(false);
                    fetchReports();
                },
                onError: () => {
                    setLoading(false);
                }
            }
        );
    };

    const handleReject = (reportId) => {
        setLoading(true);
        router.patch(`/office-staff/maintenance/driver-reports/${reportId}/status`, 
            { status: 'rejected' }, 
            {
                onSuccess: () => {
                    setLoading(false);
                    fetchReports();
                },
                onError: () => {
                    setLoading(false);
                }
            }
        );
    };

    const handleScheduleMaintenance = (inspection) => {
        setSelectedInspection(inspection);
        setScheduleData({
            mechanic_id: inspection.mechanic?.user_id || '',
            repair_date: '',
            repair_time: '',
            repair_location: '',
            parts: []
        });
        setShowScheduleModal(true);
    };

    const handleConfirmSchedule = () => {
        setLoading(true);
        // Send schedule request via fetch with CSRF token
        fetch(`/office-staff/maintenance/mechanic-inspection-reports/${selectedInspection.id}/schedule-maintenance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
            },
            body: JSON.stringify(scheduleData),
        })
        .then(res => {
            if (!res.ok) {
                // Laravel may return HTML (e.g., 419 CSRF page)
                return res.text().then(text => { throw new Error(text); });
            }
            return res.json();
        })
        .then(data => {
            if (data.success) {
                setShowScheduleModal(false);
                fetchInspectionReports();
                // Refresh driver reports if function exists
                if (typeof fetchReports === 'function') {
                    fetchReports();
                }
                setLoading(false);
            } else {
                alert(data.message || 'Failed to schedule maintenance');
                setLoading(false);
            }
        })
        .catch(error => {
            console.error('Error scheduling maintenance:', error);
            alert('Failed to schedule maintenance');
            setLoading(false);
        });
    };

    const handleUpdateInspectionStatus = (inspectionId, status) => {
        setLoading(true);
        fetch(`/office-staff/maintenance/mechanic-inspection-reports/${inspectionId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            },
            body: JSON.stringify({ status })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                fetchInspectionReports();
            } else {
                alert(data.message || 'Failed to update status');
            }
        })
        .catch(error => {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        })
        .finally(() => {
            setLoading(false);
        });
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'critical':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'high':
                return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'medium':
                return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'low':
                return 'text-green-600 bg-green-50 border-green-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'approved':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'rejected':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'in_progress':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'completed':
                return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'reviewed':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'scheduled':
                return 'text-green-600 bg-green-50 border-green-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getConditionColor = (condition) => {
        switch (condition?.toLowerCase()) {
            case 'good':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'fair':
                return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'poor':
                return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'critical':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <OfficeStaffLayout activeMenu="maintenance" user={authUser}>
            <Head title="Fleet Management" />
            <div className="max-w-7xl mx-auto pb-12">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-10 mt-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Fleet Management</h1>
                        <p className="text-slate-500 font-medium">Maintenance reports and fleet operations</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button 
                            onClick={fetchReports}
                            className="px-4 py-2.5 bg-white/70 backdrop-blur-md border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm flex items-center gap-2 font-semibold text-sm"
                        >
                            Refresh Data
                        </button>
                    </div>
                </div>

                    <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 p-6 mb-8">
                        {/* Tab Navigation */}
                        <div className="flex space-x-2 border-b border-slate-100 pb-4">
                            <button
                                onClick={() => setActiveTab('driver-reports')}
                                className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${
                                    activeTab === 'driver-reports'
                                        ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                }`}
                            >
                                Driver Reports
                            </button>
                            <button
                                onClick={() => setActiveTab('mechanic-inspections')}
                                className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${
                                    activeTab === 'mechanic-inspections'
                                        ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                }`}
                            >
                                Mechanic Inspections
                            </button>
                        </div>

                        {/* Driver Reports Tab */}
                        {activeTab === 'driver-reports' && (
                            <div className="mt-6">
                                {/* Stats Overview */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                                        <div className="text-3xl font-black text-slate-800">{reports.length}</div>
                                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Total Reports</div>
                                    </div>
                                    <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5 shadow-sm">
                                        <div className="text-3xl font-black text-amber-700">
                                            {reports.filter(r => r.status === 'pending').length}
                                        </div>
                                        <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider mt-1">Pending</div>
                                    </div>
                                    <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-5 shadow-sm">
                                        <div className="text-3xl font-black text-emerald-700">
                                            {reports.filter(r => r.status === 'approved').length}
                                        </div>
                                        <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mt-1">Approved</div>
                                    </div>
                                    <div className="bg-rose-50 rounded-2xl border border-rose-100 p-5 shadow-sm">
                                        <div className="text-3xl font-black text-rose-700">
                                            {reports.filter(r => r.status === 'rejected').length}
                                        </div>
                                        <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider mt-1">Rejected</div>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-5">Report ID</th>
                                                    <th className="px-6 py-5">Vehicle & Driver</th>
                                                    <th className="px-6 py-5">Issue Details</th>
                                                    <th className="px-6 py-5">Priority</th>
                                                    <th className="px-6 py-5">Status</th>
                                                    <th className="px-6 py-5">Date</th>
                                                    <th className="px-6 py-5 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {reports.map((report) => (
                                                    <tr key={report.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-bold text-slate-900">
                                                            #{report.id}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-800">{report.truck?.unique_id || 'N/A'}</span>
                                                                <span className="text-xs font-medium text-slate-500">{report.driver?.user?.first_name && report.driver?.user?.last_name ? `${report.driver.user.first_name} ${report.driver.user.last_name}` : report.driver?.user?.name || `DRV-${report.driver_id}`}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="max-w-[200px] whitespace-normal">
                                                                <p className="font-bold text-slate-800 text-sm line-clamp-1">{report.issue_title || 'No title'}</p>
                                                                <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">{report.issue_description || 'No description'}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getPriorityColor(report.priority_level)}`}>
                                                                {report.priority_level || 'Medium'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getStatusColor(report.status)}`}>
                                                                {report.status || 'Pending'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 font-medium text-slate-600">
                                                            {new Date(report.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            {report.status === 'pending' && (
                                                                <div className="flex items-center justify-end space-x-2">
                                                                    <button
                                                                        onClick={() => handleApprove(report.id)}
                                                                        disabled={loading}
                                                                        className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                                                    >
                                                                        Approve
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleReject(report.id)}
                                                                        disabled={loading}
                                                                        className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors disabled:opacity-50"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {report.status === 'approved' && !report.has_scheduled && (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedReport(report);
                                                                        setShowWorkflowModal(true);
                                                                    }}
                                                                    className="px-4 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                                                                >
                                                                    Process
                                                                </button>
                                                            )}
                                                            {report.status === 'approved' && report.has_scheduled && (
                                                                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                                                                    Scheduled
                                                                </span>
                                                            )}
                                                            {report.status === 'in_progress' && (
                                                                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg">
                                                                    In Progress
                                                                </span>
                                                            )}
                                                            {report.status === 'completed' && (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedReport(report);
                                                                        setShowViewModal(true);
                                                                    }}
                                                                    className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                                                >
                                                                    View
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        
                                        {reports.length === 0 && (
                                            <div className="text-center py-12">
                                                <div className="text-sm font-bold text-slate-400">No maintenance reports found</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Mechanic Inspections Tab */}
                        {activeTab === 'mechanic-inspections' && (
                            <div className="mt-6">
                                {/* Stats Overview */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                                        <div className="text-3xl font-black text-slate-800">{inspectionReports.length}</div>
                                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Total Inspections</div>
                                    </div>
                                    <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5 shadow-sm">
                                        <div className="text-3xl font-black text-amber-700">
                                            {inspectionReports.filter(r => r.status === 'pending').length}
                                        </div>
                                        <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider mt-1">Pending Review</div>
                                    </div>
                                    <div className="bg-rose-50 rounded-2xl border border-rose-100 p-5 shadow-sm">
                                        <div className="text-3xl font-black text-rose-700">
                                            {inspectionReports.filter(r => r.overall_condition === 'critical').length}
                                        </div>
                                        <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider mt-1">Critical Condition</div>
                                    </div>
                                    <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-5 shadow-sm">
                                        <div className="text-3xl font-black text-emerald-700">
                                            {inspectionReports.filter(r => r.status === 'scheduled').length}
                                        </div>
                                        <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mt-1">Scheduled</div>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-5">Inspection ID</th>
                                                    <th className="px-6 py-5">Truck & Mechanic</th>
                                                    <th className="px-6 py-5">Condition</th>
                                                    <th className="px-6 py-5">Issue Details</th>
                                                    <th className="px-6 py-5">Status</th>
                                                    <th className="px-6 py-5">Date</th>
                                                    <th className="px-6 py-5 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {inspectionReports.map((inspection) => (
                                                    <tr key={inspection.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-bold text-slate-900">
                                                            #{inspection.id}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-800">{inspection.truck?.unique_id || 'N/A'}</span>
                                                                <span className="text-xs font-medium text-slate-500">{inspection.mechanic?.name || 'Unknown Mechanic'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getConditionColor(inspection.overall_condition)}`}>
                                                                {inspection.overall_condition || 'Good'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="max-w-[200px] whitespace-normal">
                                                                <p className="font-bold text-slate-800 text-sm line-clamp-1">{inspection.issue_title || 'No issues'}</p>
                                                                <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">{inspection.issue_description || '-'}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getStatusColor(inspection.status)}`}>
                                                                {inspection.status || 'Pending'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 font-medium text-slate-600">
                                                            {new Date(inspection.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            {(inspection.status === 'pending' || inspection.status === 'reviewed') && inspection.issue_title && (
                                                                <button
                                                                    onClick={() => handleScheduleMaintenance(inspection)}
                                                                    disabled={loading}
                                                                    className="px-4 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50"
                                                                >
                                                                    Schedule Repair
                                                                </button>
                                                            )}
                                                            {inspection.status === 'pending' && !inspection.issue_title && (
                                                                <button
                                                                    onClick={() => handleUpdateInspectionStatus(inspection.id, 'reviewed')}
                                                                    disabled={loading}
                                                                    className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                                                                >
                                                                    Acknowledge
                                                                </button>
                                                            )}
                                                            {inspection.status === 'reviewed' && !inspection.issue_title && (
                                                                <span className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                                                                    Reviewed
                                                                </span>
                                                            )}
                                                            {inspection.status === 'scheduled' && (
                                                                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg">
                                                                    Scheduled
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        
                                        {inspectionReports.length === 0 && (
                                            <div className="text-center py-12">
                                                <div className="text-sm font-bold text-slate-400">No inspection reports found</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Workflow Modal */}
                <WorkflowModal
                    isOpen={showWorkflowModal}
                    onClose={() => {
                        setShowWorkflowModal(false);
                        setSelectedReport(null);
                    }}
                    report={selectedReport}
                    authUser={authUser}
                    mechanics={mechanics}
                />

                {/* View Modal (Read-only for completed reports) */}
                <ViewModal
                    isOpen={showViewModal}
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedReport(null);
                    }}
                    report={selectedReport}
                />

                {/* Schedule Maintenance Modal */}
                {showScheduleModal && selectedInspection && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex min-h-screen items-center justify-center p-4">
                            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={() => setShowScheduleModal(false)} />
                            
                            <div className="relative w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 overflow-hidden">
                                <div className="border-b border-slate-200/50 bg-white/50 px-6 py-5">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Schedule Maintenance</h3>
                                    <p className="text-sm font-medium text-slate-500 mt-1">Create maintenance schedule from inspection report #{selectedInspection.id}</p>
                                </div>
                                
                                <div className="px-6 py-6 space-y-6">
                                    {/* Inspection Details */}
                                    <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100">
                                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Inspection Details</h4>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-slate-500 uppercase tracking-wider text-xs">Truck</span>
                                                <span className="font-bold text-slate-900">{selectedInspection.truck?.unique_id} - {selectedInspection.truck?.plate_number}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-slate-500 uppercase tracking-wider text-xs">Condition</span>
                                                <span className={`font-bold px-2.5 py-1 text-xs uppercase tracking-wider rounded-md border bg-white ${getConditionColor(selectedInspection.overall_condition).split(' ')[0]}`}>
                                                    {selectedInspection.overall_condition}
                                                </span>
                                            </div>
                                            {selectedInspection.issue_title && (
                                                <div className="pt-2 border-t border-slate-200/50 mt-2">
                                                    <span className="font-semibold text-slate-500 uppercase tracking-wider text-xs block mb-1">Issue</span>
                                                    <span className="font-bold text-slate-900">{selectedInspection.issue_title}</span>
                                                </div>
                                            )}
                                            {selectedInspection.issue_description && (
                                                <div className="pt-2">
                                                    <span className="font-semibold text-slate-500 uppercase tracking-wider text-xs block mb-1">Description</span>
                                                    <div className="mt-1 text-slate-700 bg-white p-3 rounded-xl border border-slate-200 whitespace-pre-wrap font-medium text-sm">
                                                        {selectedInspection.issue_description}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Schedule Form */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Assign Mechanic</label>
                                            <select
                                                value={scheduleData.mechanic_id}
                                                onChange={(e) => setScheduleData({ ...scheduleData, mechanic_id: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-medium text-slate-700 transition-colors"
                                            >
                                                <option value="">Select Mechanic</option>
                                                {availableMechanics.map((mechanic) => (
                                                    <option key={mechanic.user_id} value={mechanic.user_id}>
                                                        {mechanic.firstname} {mechanic.lastname}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Repair Date</label>
                                                <input
                                                    type="date"
                                                    value={scheduleData.repair_date}
                                                    onChange={(e) => setScheduleData({ ...scheduleData, repair_date: e.target.value })}
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-slate-700 transition-colors"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Repair Time</label>
                                                <input
                                                    type="time"
                                                    value={scheduleData.repair_time}
                                                    onChange={(e) => setScheduleData({ ...scheduleData, repair_time: e.target.value })}
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-slate-700 transition-colors"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Repair Location</label>
                                            <input
                                                type="text"
                                                value={scheduleData.repair_location}
                                                onChange={(e) => setScheduleData({ ...scheduleData, repair_location: e.target.value })}
                                                placeholder="Enter repair location"
                                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-slate-700 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-200/50 px-6 py-4 bg-slate-50/50 backdrop-blur-md flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowScheduleModal(false)}
                                        className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmSchedule}
                                        disabled={loading}
                                        className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Scheduling...' : 'Schedule Maintenance'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
        </OfficeStaffLayout>
    );
};

export default FleetManagement;
