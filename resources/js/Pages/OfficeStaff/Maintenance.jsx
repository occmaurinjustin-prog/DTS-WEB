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
    calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    location: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
    wrench: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    minus: 'M20 12H4',
    plusCircle: 'M12 9v6m0 0l-3-3m3 3l3-3m12 0a9 9 0 11-18 0 9 9 0 0118 0z'
};

function Icon({ name, className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={Icons[name]} />
        </svg>
    );
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
function WorkflowModal({ isOpen, onClose, report, authUser }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [inventory, setInventory] = useState([]);
    const [selectedParts, setSelectedParts] = useState([]);
    
    // Form data for each step
    const [scheduleData, setScheduleData] = useState({
        repair_date: '',
        repair_time: '',
        repair_location: ''
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
                <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" onClick={onClose} />
                
                <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl">
                    {/* Progress Stepper */}
                    <div className="border-b border-gray-200 px-6 py-7">
                        <div className="flex items-center justify-between">
                            {steps.map((step, index) => (
                                <div key={step.id} className="flex items-center">
                                    <div className="flex items-center">
                                        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                                            currentStep >= step.id 
                                                ? 'bg-blue-600 border-blue-600 text-white' 
                                                : 'bg-white border-gray-300 text-gray-400'
                                        }`}>
                                            <Icon name={step.icon} className="w-4 h-4" />
                                        </div>
                                        <span className={`ml-2 text-xs font-medium ${
                                            currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                                        }`}>
                                            {step.name}
                                        </span>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`w-12 h-0.5 mx-2 ${
                                            currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
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
                            />
                        )}
                        {currentStep === 4 && (
                            <Step4Review 
                                report={report}
                                selectedParts={selectedParts}
                                scheduleData={scheduleData}
                            />
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {currentStep > 1 && (
                                    <button
                                        onClick={handlePrevious}
                                        className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <Icon name="arrowLeft" className="w-4 h-4" />
                                        Previous
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                            
                            {currentStep < 4 ? (
                                <button
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Next
                                    <Icon name="arrowRight" className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleConfirm}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
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
                <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" onClick={onClose} />
                
                <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl">
                    {/* Header */}
                    <div className="border-b border-gray-200 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">Maintenance Record</h2>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                                <Icon name="close" className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
                        {/* Status Badge */}
                        <div className="mb-6">
                            <span className={`inline-flex px-4 py-2 text-sm font-medium rounded-lg border ${getStatusColor(report.status)}`}>
                                {report.status?.replace('_', ' ')}
                            </span>
                        </div>

                        {/* Report Details */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Report ID</label>
                                    <p className="text-base font-medium text-gray-900">#{report.id}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Driver</label>
                                    <p className="text-base font-medium text-gray-900">
                                        {report.driver?.user?.name || `DRV-${report.driver_id}`}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Truck ID</label>
                                    <p className="text-base font-medium text-gray-900">{report.truck_id}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Priority</label>
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(report.priority_level)}`}>
                                        {report.priority_level}
                                    </span>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Issue</label>
                                    <p className="text-base font-medium text-gray-900">{report.issue_title}</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                                    <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-200">
                                        {report.issue_description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Maintenance Schedule */}
                        {report.maintenance && (
                            <div className="bg-blue-50 rounded-xl p-4 mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    <Icon name="calendar" className="w-5 h-5 inline mr-2" />
                                    Scheduled Maintenance
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Date</label>
                                        <p className="text-base font-medium text-gray-900">
                                            {report.maintenance.repair_date}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Time</label>
                                        <p className="text-base font-medium text-gray-900">
                                            {report.maintenance.repair_time}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Location</label>
                                        <p className="text-base font-medium text-gray-900">
                                            {report.maintenance.repair_location}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Completion Info */}
                        {report.completed_at && (
                            <div className="bg-emerald-50 rounded-xl p-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    <Icon name="check" className="w-5 h-5 inline mr-2" />
                                    Completion Information
                                </h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Completed On</label>
                                    <p className="text-base font-medium text-gray-900">
                                        {new Date(report.completed_at).toLocaleDateString('en-US', { 
                                            month: 'long', day: 'numeric', year: 'numeric' 
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Maintenance Report Details</h2>
                <p className="text-gray-600">Review the submitted maintenance report information</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Driver ID</label>
                        <p className="text-lg font-medium text-gray-900">
                            {report.driver?.user?.name || `DRV-${report.driver_id}`}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Truck ID</label>
                        <p className="text-lg font-medium text-gray-900">{report.truck_id || `TRK-${report.truck_id}`}</p>
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
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Select Parts From Inventory</h2>
                <p className="text-gray-600">Choose the parts needed for this maintenance job</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
                {/* Parts Table */}
                <div className="col-span-2">
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
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
                    <div className="bg-white border border-gray-200 rounded-xl p-4 sticky top-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Parts Summary</h3>
                        
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
function Step3Scheduling({ scheduleData, setScheduleData }) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Maintenance Scheduling</h2>
                <p className="text-gray-600">Set up the repair schedule</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-4">
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
                    
                </div>
            </div>
        </div>
    );
}

// Step 4: Review & Confirm
function Step4Review({ report, selectedParts, scheduleData }) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Review & Confirm</h2>
                <p className="text-gray-600">Review all details before confirming the maintenance workflow</p>
            </div>
            
            {/* Alert Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Icon name="alert" className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-semibold text-blue-900">Confirmation Required</h4>
                        <p className="text-sm text-blue-700 mt-1">
                            Please review all details carefully. Once confirmed, this maintenance workflow will be processed and notifications will be sent to the assigned mechanic.
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                {/* Report Summary */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Report Summary</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Report ID</span>
                            <span className="text-sm font-medium text-gray-900">#{report.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Driver</span>
                            <span className="text-sm font-medium text-gray-900">
                                {report.driver?.user?.name || `DRV-${report.driver_id}`}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Truck</span>
                            <span className="text-sm font-medium text-gray-900">{report.truck_id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Issue</span>
                            <span className="text-sm font-medium text-gray-900">{report.issue_title}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Priority</span>
                            <StatusBadge status={report.priority_level} />
                        </div>
                    </div>
                </div>
                
                {/* Parts Summary */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Parts Summary</h3>
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
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Details</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Date</span>
                            <span className="text-sm font-medium text-gray-900">
                                {new Date(scheduleData.repair_date).toLocaleDateString('en-US', { 
                                    month: 'long', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                })}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Time</span>
                            <span className="text-sm font-medium text-gray-900">{scheduleData.repair_time}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Location</span>
                            <span className="text-sm font-medium text-gray-900">{scheduleData.repair_location}</span>
                        </div>
                                            </div>
                </div>
                
                {/* Final Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Final Summary</h3>
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

const FleetManagement = ({ authUser, reports: initialReports }) => {
    const [reports, setReports] = useState(initialReports || []);
    const [loading, setLoading] = useState(false);
    const [showWorkflowModal, setShowWorkflowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

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

    useEffect(() => {
        if (!initialReports?.length) {
            fetchReports();
        }
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

    const handleStart = (reportId) => {
        setLoading(true);
        router.patch(`/office-staff/maintenance/driver-reports/${reportId}/status`, 
            { status: 'in_progress' }, 
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

    const handleComplete = (reportId) => {
        setLoading(true);
        router.patch(`/office-staff/maintenance/driver-reports/${reportId}/status`, 
            { status: 'completed' }, 
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
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <>
            <Head title="Fleet Management" />
            <OfficeStaffLayout user={authUser}>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
                    {/* Header */}
                    <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                        <div className="max-w-7xl mx-auto px-6 py-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-light tracking-tight text-slate-900">Fleet Management</h1>
                                    <p className="text-sm text-slate-500 mt-1 font-light">Maintenance reports and fleet operations</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button 
                                        onClick={fetchReports}
                                        className="px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-200 shadow-sm"
                                    >
                                        Refresh
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        {/* Stats Overview */}
                        <div className="grid grid-cols-4 gap-4 mb-8">
                            <div className="bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-sm">
                                <div className="text-2xl font-light text-slate-900">{reports.length}</div>
                                <div className="text-xs text-slate-500 font-light mt-1">Total Reports</div>
                            </div>
                            <div className="bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-sm">
                                <div className="text-2xl font-light text-amber-600">
                                    {reports.filter(r => r.status === 'pending').length}
                                </div>
                                <div className="text-xs text-slate-500 font-light mt-1">Pending</div>
                            </div>
                            <div className="bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-sm">
                                <div className="text-2xl font-light text-green-600">
                                    {reports.filter(r => r.status === 'approved').length}
                                </div>
                                <div className="text-xs text-slate-500 font-light mt-1">Approved</div>
                            </div>
                            <div className="bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-sm">
                                <div className="text-2xl font-light text-red-600">
                                    {reports.filter(r => r.status === 'rejected').length}
                                </div>
                                <div className="text-xs text-slate-500 font-light mt-1">Rejected</div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50/50">
                                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Report ID</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Driver ID</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Truck ID</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Issue Details</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Priority</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {reports.map((report) => (
                                            <tr key={report.id} className="hover:bg-slate-50/30 transition-colors duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-light text-slate-900">
                                                    #{report.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-light text-slate-600">
                                                    {report.driver?.user?.name || `DRV-${report.driver_id}`}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-light text-slate-600">
                                                    {report.truck_id || `TRK-${report.truck_id}`}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-light text-slate-700">
                                                    <div className="max-w-xs">
                                                        <div className="font-medium text-slate-900 truncate">
                                                            {report.issue_title || 'No title'}
                                                        </div>
                                                        <div className="text-xs text-slate-500 mt-1 truncate">
                                                            {report.issue_description || 'No description'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(report.priority_level)}`}>
                                                        {report.priority_level || 'Medium'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(report.status)}`}>
                                                        {report.status || 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-light text-slate-600">
                                                    {new Date(report.created_at).toLocaleDateString('en-US', { 
                                                        month: 'short', 
                                                        day: 'numeric', 
                                                        year: 'numeric' 
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {report.status === 'pending' && (
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => handleApprove(report.id)}
                                                                disabled={loading}
                                                                className="px-3 py-1 text-xs font-medium text-white bg-green-600 border border-green-600 rounded-md hover:bg-green-700 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(report.id)}
                                                                disabled={loading}
                                                                className="px-3 py-1 text-xs font-medium text-white bg-red-600 border border-red-600 rounded-md hover:bg-red-700 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                                                            className="px-3 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors duration-200 shadow-sm"
                                                        >
                                                            View Process
                                                        </button>
                                                    )}
                                                    {report.status === 'approved' && report.has_scheduled && (
                                                        <button
                                                            onClick={() => handleStart(report.id)}
                                                            disabled={loading}
                                                            className="px-3 py-1 text-xs font-medium text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            Start
                                                        </button>
                                                    )}
                                                    {report.status === 'in_progress' && (
                                                        <button
                                                            onClick={() => handleComplete(report.id)}
                                                            disabled={loading}
                                                            className="px-3 py-1 text-xs font-medium text-white bg-emerald-600 border border-emerald-600 rounded-md hover:bg-emerald-700 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            Complete
                                                        </button>
                                                    )}
                                                    {report.status === 'completed' && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedReport(report);
                                                                setShowViewModal(true);
                                                            }}
                                                            className="px-3 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors duration-200 shadow-sm"
                                                        >
                                                            View
                                                        </button>
                                                    )}
                                                    {report.status !== 'pending' && report.status !== 'approved' && report.status !== 'in_progress' && report.status !== 'completed' && (
                                                        <span className="text-xs font-light text-slate-400 italic">
                                                            {report.status}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                
                                {reports.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="text-sm font-light text-slate-400">No maintenance reports found</div>
                                    </div>
                                )}
                            </div>
                        </div>
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
            </OfficeStaffLayout>
        </>
    );
};

export default FleetManagement;
