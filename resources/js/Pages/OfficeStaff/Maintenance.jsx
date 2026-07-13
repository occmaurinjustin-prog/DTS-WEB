import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import OfficeStaffLayout from '../../Layouts/OfficeStaffLayout';
import { 
    LayoutDashboard, Package, BarChart3, Plus, Search, Filter, 
    Edit2, Trash2, X, Check, AlertCircle, User, ArrowRight, ArrowLeft, 
    Download, Upload, Calendar, Clock, MapPin, Wrench, Minus, PlusCircle 
} from 'lucide-react';
import Pagination from '@/Components/Pagination';
import usePagination from '@/hooks/usePagination';

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
        { id: 2, name: 'Schedule', icon: 'calendar' },
        { id: 3, name: 'Review', icon: 'check' }
    ];

    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

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
                <div className="fixed inset-0 bg-black/40 transition-opacity" onClick={onClose} />
                
                <div className="relative w-full max-w-4xl bg-white border border-zinc-200 shadow-xl overflow-hidden">
                    {/* Progress Stepper */}
                    <div className="border-b border-zinc-200 bg-white px-6 py-6">
                        <div className="flex items-center justify-between">
                            {steps.map((step, index) => (
                                <div key={step.id} className="flex items-center">
                                    <div className="flex items-center">
                                        <div className={`flex items-center justify-center w-8 h-8 border transition-all duration-300 ${
                                            currentStep >= step.id 
                                                ? 'bg-zinc-900 border-zinc-900 text-white' 
                                                : 'bg-white border-zinc-200 text-zinc-400'
                                        }`}>
                                            <Icon name={step.icon} className="w-4 h-4" />
                                        </div>
                                        <span className={`ml-3 text-xs font-semibold uppercase tracking-widest ${
                                            currentStep >= step.id ? 'text-zinc-900' : 'text-zinc-400'
                                        }`}>
                                            {step.name}
                                        </span>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`w-12 h-[1px] mx-4 transition-all duration-300 ${
                                            currentStep > step.id ? 'bg-zinc-900' : 'bg-zinc-200'
                                        }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Error Message */}
                    {errorMessage && (
                        <div className="px-6 pt-4">
                            <div className="bg-red-50 border border-red-200 p-3">
                                <div className="flex items-center gap-2">
                                    <Icon name="alert" className="w-4 h-4 text-red-600" />
                                    <p className="text-xs font-semibold text-red-700">{errorMessage}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step Content */}
                    <div className="px-6 py-6 max-h-[65vh] overflow-y-auto">
                        {currentStep === 1 && <Step1ReportDetails report={report} />}
                        {currentStep === 2 && (
                            <Step3Scheduling 
                                scheduleData={scheduleData}
                                setScheduleData={setScheduleData}
                                mechanics={mechanics}
                            />
                        )}
                        {currentStep === 3 && (
                            <Step4Review 
                                report={report}
                                scheduleData={scheduleData}
                                mechanics={mechanics}
                            />
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="border-t border-zinc-200 px-6 py-4 bg-zinc-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {currentStep > 1 && (
                                    <button
                                        onClick={handlePrevious}
                                        className="flex items-center gap-2 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors"
                                    >
                                        <Icon name="arrowLeft" className="w-4 h-4" />
                                        Previous
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="px-5 py-2 text-xs font-semibold uppercase tracking-widest text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                            
                            {currentStep < 3 ? (
                                <button
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-5 py-2 text-xs font-semibold uppercase tracking-widest bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
                                >
                                    Next Step
                                    <Icon name="arrowRight" className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleConfirm}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-5 py-2 text-xs font-semibold uppercase tracking-widest bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
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
            default: return 'text-zinc-600 bg-zinc-50 border-zinc-200';
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200';
            default: return 'text-zinc-600 bg-zinc-50 border-zinc-200';
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/40 transition-opacity" onClick={onClose} />
                
                <div className="relative w-full max-w-3xl bg-white shadow-xl border border-zinc-200 overflow-hidden">
                    {/* Header */}
                    <div className="border-b border-zinc-200 bg-white px-6 py-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Maintenance Record</h2>
                            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                                <Icon name="close" className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
                        {/* Status Badge */}
                        <div className="mb-6 flex items-center justify-between">
                            <span className={`inline-flex px-3 py-1 text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(report.status)}`}>
                                {report.status?.replace('_', ' ')}
                            </span>
                        </div>

                        {/* Report Details */}
                        <div className="bg-white p-5 mb-6 border border-zinc-200">
                            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Report Details</h3>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Report ID</label>
                                    <p className="text-sm font-semibold text-zinc-900 mt-1">#{report.id}</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Driver</label>
                                    <p className="text-sm font-semibold text-zinc-900 mt-1">
                                        {report.driver?.user?.first_name && report.driver?.user?.last_name 
                                            ? `${report.driver.user.first_name} ${report.driver.user.last_name}`
                                            : report.driver?.user?.name || `DRV-${report.driver_id}`
                                        }
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Vehicle Type</label>
                                    <p className="text-sm font-semibold text-zinc-900 mt-1">{report.truck?.vehicle_type || 'Unknown'}</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Priority</label>
                                    <div className="mt-1">
                                        <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${getPriorityColor(report.priority_level)}`}>
                                            {report.priority_level}
                                        </span>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1">Issue</label>
                                    <p className="text-sm font-semibold text-zinc-900">{report.issue_title}</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1">Description</label>
                                    <p className="text-sm font-medium text-zinc-600 bg-zinc-50 p-4 border border-zinc-200">
                                        {report.issue_description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Maintenance Schedule */}
                        {report.maintenance && (
                            <div className="bg-zinc-50 p-5 mb-6 border border-zinc-200">
                                <h3 className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest mb-4 flex items-center">
                                    <Icon name="calendar" className="w-4 h-4 inline mr-2" />
                                    Scheduled Maintenance
                                </h3>
                                <div className="grid grid-cols-3 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Date</label>
                                        <p className="text-sm font-semibold text-zinc-900 mt-1">
                                            {report.maintenance.repair_date}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Time</label>
                                        <p className="text-sm font-semibold text-zinc-900 mt-1">
                                            {report.maintenance.repair_time}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Location</label>
                                        <p className="text-sm font-semibold text-zinc-900 mt-1">
                                            {report.maintenance.repair_location}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Completion Info */}
                        {report.completed_at && (
                            <div className="bg-emerald-50 p-5 border border-emerald-200">
                                <h3 className="text-[10px] font-bold text-emerald-900 uppercase tracking-widest mb-4 flex items-center">
                                    <Icon name="check" className="w-4 h-4 inline mr-2" />
                                    Completion Information
                                </h3>
                                <div>
                                    <label className="block text-[10px] font-semibold text-emerald-600 uppercase tracking-widest">Completed On</label>
                                    <p className="text-sm font-semibold text-emerald-900 mt-1">
                                        {new Date(report.completed_at).toLocaleDateString('en-US', { 
                                            month: 'long', day: 'numeric', year: 'numeric' 
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-zinc-200 px-6 py-4 bg-zinc-50 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-5 py-2 text-xs font-semibold uppercase tracking-widest text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors"
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
            case 'critical': return 'text-red-600 bg-red-50 border-red-200';
            case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'low': return 'text-green-600 bg-green-50 border-green-200';
            default: return 'text-zinc-600 bg-zinc-50 border-zinc-200';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-zinc-900 tracking-tight mb-1">Maintenance Report Details</h2>
                <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">Review the submitted maintenance report information</p>
            </div>
            
            <div className="bg-white border border-zinc-200 p-5">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Driver</label>
                        <p className="text-sm font-semibold text-zinc-900">
                            {report.driver?.user?.first_name && report.driver?.user?.last_name 
                                ? `${report.driver.user.first_name} ${report.driver.user.last_name}`
                                : report.driver?.user?.name || `DRV-${report.driver_id}`
                            }
                        </p>
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Vehicle Type</label>
                        <p className="text-sm font-semibold text-zinc-900">{report.truck?.vehicle_type || 'Unknown'}</p>
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Priority</label>
                        <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${getPriorityColor(report.priority_level)}`}>
                            {report.priority_level || 'Medium'}
                        </span>
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Date Submitted</label>
                        <p className="text-sm font-semibold text-zinc-900">
                            {new Date(report.created_at).toLocaleDateString('en-US', { 
                                month: 'long', 
                                day: 'numeric', 
                                year: 'numeric' 
                            })}
                        </p>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Issue Title</label>
                        <p className="text-sm font-semibold text-zinc-900">{report.issue_title || 'No title'}</p>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Issue Description</label>
                        <p className="text-sm font-medium text-zinc-700 bg-zinc-50 border border-zinc-200 p-3">{report.issue_description || 'No description'}</p>
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Current Status</label>
                        <StatusBadge status={report.status} />
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
                <h2 className="text-xl font-bold text-zinc-900 tracking-tight mb-1">Maintenance Scheduling</h2>
                <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">Set up the repair schedule</p>
            </div>
            
            <div className="bg-white border border-zinc-200 p-5">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-700 mb-2">
                            <Icon name="calendar" className="w-3 h-3 inline mr-1" />
                            Repair Date *
                        </label>
                        <input
                            type="date"
                            value={scheduleData.repair_date}
                            onChange={(e) => setScheduleData({ ...scheduleData, repair_date: e.target.value })}
                            className="w-full px-4 py-2 border border-zinc-300 focus:outline-none focus:border-zinc-500 focus:ring-0 text-sm font-medium text-zinc-800"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-700 mb-2">
                            <Icon name="clock" className="w-3 h-3 inline mr-1" />
                            Repair Time *
                        </label>
                        <input
                            type="time"
                            value={scheduleData.repair_time}
                            onChange={(e) => setScheduleData({ ...scheduleData, repair_time: e.target.value })}
                            className="w-full px-4 py-2 border border-zinc-300 focus:outline-none focus:border-zinc-500 focus:ring-0 text-sm font-medium text-zinc-800"
                            required
                        />
                    </div>
                    
                    <div className="col-span-2">
                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-700 mb-2">
                            <Icon name="location" className="w-3 h-3 inline mr-1" />
                            Repair Location *
                        </label>
                        <input
                            type="text"
                            value={scheduleData.repair_location}
                            onChange={(e) => setScheduleData({ ...scheduleData, repair_location: e.target.value })}
                            placeholder="e.g., Main Garage, Workshop Bay 3"
                            className="w-full px-4 py-2 border border-zinc-300 focus:outline-none focus:border-zinc-500 focus:ring-0 text-sm font-medium text-zinc-800"
                            required
                        />
                    </div>
                    
                    <div className="col-span-2">
                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-700 mb-2">
                            <Icon name="user" className="w-3 h-3 inline mr-1" />
                            Assign Mechanic *
                        </label>
                        <select
                            value={scheduleData.assign_mechanics}
                            onChange={(e) => setScheduleData({ ...scheduleData, assign_mechanics: e.target.value })}
                            className="w-full px-4 py-2 border border-zinc-300 focus:outline-none focus:border-zinc-500 focus:ring-0 bg-white text-sm font-medium text-zinc-800"
                            required
                        >
                            <option value="">Select a Mechanic</option>
                            {mechanics.map((mechanic) => (
                                <option key={mechanic.user_id} value={mechanic.user_id}>
                                    {mechanic.firstname && mechanic.lastname ? `${mechanic.firstname} ${mechanic.lastname}` : mechanic.username || mechanic.name}
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
function Step4Review({ report, scheduleData, mechanics = [] }) {
    const assignedMechanic = mechanics.find(m => m.user_id.toString() === scheduleData.assign_mechanics?.toString());
    const mechanicName = assignedMechanic 
        ? (assignedMechanic.firstname && assignedMechanic.lastname ? `${assignedMechanic.firstname} ${assignedMechanic.lastname}` : assignedMechanic.username || assignedMechanic.name)
        : 'Not Assigned';
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-zinc-900 tracking-tight mb-1">Review & Confirm</h2>
                <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">Review all details before confirming the maintenance workflow</p>
            </div>
            
            {/* Alert Box */}
            <div className="bg-zinc-50 border border-zinc-200 p-5">
                <div className="flex items-start gap-3">
                    <Icon name="alert" className="w-4 h-4 text-zinc-600 mt-0.5" />
                    <div>
                        <h4 className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest">Confirmation Required</h4>
                        <p className="text-sm font-medium text-zinc-600 mt-1">
                            Please review all details carefully. Once confirmed, this maintenance workflow will be processed and notifications will be sent to the assigned mechanic ({mechanicName}).
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
                {/* Report Summary */}
                <div className="bg-white border border-zinc-200 p-5">
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Maintenance Report Summary</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Report ID</span>
                            <span className="text-sm font-bold text-zinc-900">#{report.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Driver</span>
                            <span className="text-sm font-semibold text-zinc-900">
                                {report.driver?.user?.first_name && report.driver?.user?.last_name 
                                    ? `${report.driver.user.first_name} ${report.driver.user.last_name}`
                                    : report.driver?.user?.name || `DRV-${report.driver_id}`
                                }
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Vehicle Type</span>
                            <span className="text-sm font-semibold text-zinc-900">{report.truck?.vehicle_type || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Issue</span>
                            <span className="text-sm font-semibold text-zinc-900">{report.issue_title}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Priority</span>
                            <StatusBadge status={report.priority_level} />
                        </div>
                        <div className="flex justify-between border-t border-zinc-200 pt-3 mt-1">
                            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Assigned Mechanic</span>
                            <span className="text-sm font-semibold text-zinc-900">{mechanicName}</span>
                        </div>
                    </div>
                </div>
                
                
                {/* Schedule Details */}
                <div className="bg-white border border-zinc-200 p-5">
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Schedule Details</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Date</span>
                            <span className="text-sm font-semibold text-zinc-900">
                                {new Date(scheduleData.repair_date).toLocaleDateString('en-US', { 
                                    month: 'long', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                })}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Time</span>
                            <span className="text-sm font-semibold text-zinc-900">{scheduleData.repair_time}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Location</span>
                            <span className="text-sm font-semibold text-zinc-900">{scheduleData.repair_location}</span>
                        </div>
                    </div>
                </div>
                
                {/* Final Summary */}
                <div className="col-span-2 bg-zinc-50 border border-zinc-200 p-5">
                    <h3 className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest mb-4">Final Summary</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Icon name="check" className="w-4 h-4 text-zinc-900" />
                            <span className="text-sm font-medium text-zinc-700">Maintenance report reviewed and approved</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Icon name="check" className="w-4 h-4 text-zinc-900" />
                            <span className="text-sm font-medium text-zinc-700">Repair schedule configured</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Icon name="check" className="w-4 h-4 text-zinc-900" />
                            <span className="text-sm font-medium text-zinc-700">Mechanic assigned to job</span>
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

    const { paginatedData: paginatedReports, currentPage: reportsPage, setCurrentPage: setReportsPage, totalPages: reportsTotalPages } = usePagination(reports, 10);
    const { paginatedData: paginatedInspections, currentPage: inspectionsPage, setCurrentPage: setInspectionsPage, totalPages: inspectionsTotalPages } = usePagination(inspectionReports, 10);
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

        // Listen for new Maintenance Reports
        if (window.Echo) {
            const channel = window.Echo.channel('maintenance');
            channel.listen('MaintenanceReportUpdated', (e) => {
                console.log('MaintenanceReportUpdated event received:', e);
                fetchReports();
                fetchInspectionReports();
            });

            return () => {
                window.Echo.leave('maintenance');
            };
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
            <div className="max-w-7xl pb-12">


                    <div className="bg-white border border-zinc-200 p-6 mb-8">
                        {/* Tab Navigation */}
                        <div className="flex space-x-2 border-b border-zinc-200 pb-4 mb-6">
                            <button
                                onClick={() => setActiveTab('driver-reports')}
                                className={`px-5 py-2 text-xs font-bold uppercase tracking-widest transition-colors border ${
                                    activeTab === 'driver-reports'
                                        ? 'bg-red-600 text-white border-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                        : 'text-zinc-500 hover:text-black bg-white hover:bg-zinc-100 border-transparent hover:border-black'
                                }`}
                            >
                                Driver Reports
                            </button>
                            <button
                                onClick={() => setActiveTab('mechanic-inspections')}
                                className={`px-5 py-2 text-xs font-bold uppercase tracking-widest transition-colors border ${
                                    activeTab === 'mechanic-inspections'
                                        ? 'bg-red-600 text-white border-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                        : 'text-zinc-500 hover:text-black bg-white hover:bg-zinc-100 border-transparent hover:border-black'
                                }`}
                            >
                                Mechanic Inspections
                            </button>
                        </div>

                        {/* Driver Reports Tab */}
                        {activeTab === 'driver-reports' && (
                            <div>
                                {/* Stats Overview */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                    <div className="bg-white border border-zinc-200 p-5">
                                        <div className="text-3xl font-bold text-zinc-900">{reports.length}</div>
                                        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mt-1">Total Reports</div>
                                    </div>
                                    <div className="bg-amber-50 border border-amber-200 p-5">
                                        <div className="text-3xl font-bold text-amber-700">
                                            {reports.filter(r => r.status === 'pending').length}
                                        </div>
                                        <div className="text-[10px] font-semibold text-amber-600 uppercase tracking-widest mt-1">Pending</div>
                                    </div>
                                    <div className="bg-emerald-50 border border-emerald-200 p-5">
                                        <div className="text-3xl font-bold text-emerald-700">
                                            {reports.filter(r => r.status === 'approved').length}
                                        </div>
                                        <div className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest mt-1">Approved</div>
                                    </div>
                                    <div className="bg-red-50 border border-red-200 p-5">
                                        <div className="text-3xl font-bold text-red-700">
                                            {reports.filter(r => r.status === 'rejected').length}
                                        </div>
                                        <div className="text-[10px] font-semibold text-red-600 uppercase tracking-widest mt-1">Rejected</div>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="bg-white border border-zinc-300 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                            <thead className="bg-black text-white font-bold uppercase text-[10px] tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-4">Report ID</th>
                                                    <th className="px-6 py-4">Vehicle & Driver</th>
                                                    <th className="px-6 py-4">Issue Details</th>
                                                    <th className="px-6 py-4">Priority</th>
                                                    <th className="px-6 py-4">Status</th>
                                                    <th className="px-6 py-4">Date</th>
                                                    <th className="px-6 py-4 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100">
                                                {paginatedReports.map((report) => (
                                                    <tr key={report.id} className="hover:bg-zinc-50 transition-colors">
                                                        <td className="px-6 py-4 font-semibold text-zinc-900">
                                                            #{report.id}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-zinc-800">{report.truck?.unique_id || 'N/A'}</span>
                                                                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{report.driver?.user?.first_name && report.driver?.user?.last_name ? `${report.driver.user.first_name} ${report.driver.user.last_name}` : report.driver?.user?.name || `DRV-${report.driver_id}`}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="max-w-[200px] whitespace-normal">
                                                                <p className="font-medium text-zinc-800 text-sm line-clamp-1">{report.issue_title || 'No title'}</p>
                                                                <p className="text-xs text-zinc-500 font-medium line-clamp-1 mt-0.5">{report.issue_description || 'No description'}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${getPriorityColor(report.priority_level)}`}>
                                                                {report.priority_level || 'Medium'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(report.status)}`}>
                                                                {report.status || 'Pending'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs font-medium text-zinc-600 uppercase tracking-wide">
                                                            {new Date(report.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            {report.status === 'pending' && (
                                                                <div className="flex items-center justify-end space-x-2">
                                                                    <button
                                                                        onClick={() => handleApprove(report.id)}
                                                                        disabled={loading}
                                                                        className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                                                    >
                                                                        Approve
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleReject(report.id)}
                                                                        disabled={loading}
                                                                        className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
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
                                                                    className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white bg-zinc-900 hover:bg-zinc-800 transition-colors"
                                                                >
                                                                    Process
                                                                </button>
                                                            )}
                                                            {report.status === 'approved' && report.has_scheduled && (
                                                                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-100 border border-zinc-200">
                                                                    Scheduled
                                                                </span>
                                                            )}
                                                            {report.status === 'in_progress' && (
                                                                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-200">
                                                                    In Progress
                                                                </span>
                                                            )}
                                                            {report.status === 'completed' && (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedReport(report);
                                                                        setShowViewModal(true);
                                                                    }}
                                                                    className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors"
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
                                                <div className="text-xs uppercase tracking-widest font-semibold text-zinc-400">No maintenance reports found</div>
                                            </div>
                                        )}
                                    </div>
                                    <Pagination
                                        currentPage={reportsPage}
                                        totalPages={reportsTotalPages}
                                        onPageChange={setReportsPage}
                                        totalItems={reports.length}
                                        itemsPerPage={10}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Mechanic Inspections Tab */}
                        {activeTab === 'mechanic-inspections' && (
                            <div>
                                {/* Stats Overview */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                    <div className="bg-white border border-zinc-200 p-5">
                                        <div className="text-3xl font-bold text-zinc-800">{inspectionReports.length}</div>
                                        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mt-1">Total Inspections</div>
                                    </div>
                                    <div className="bg-amber-50 border border-amber-200 p-5">
                                        <div className="text-3xl font-bold text-amber-700">
                                            {inspectionReports.filter(r => r.status === 'pending').length}
                                        </div>
                                        <div className="text-[10px] font-semibold text-amber-600 uppercase tracking-widest mt-1">Pending Review</div>
                                    </div>
                                    <div className="bg-red-50 border border-red-200 p-5">
                                        <div className="text-3xl font-bold text-red-700">
                                            {inspectionReports.filter(r => r.overall_condition === 'critical').length}
                                        </div>
                                        <div className="text-[10px] font-semibold text-red-600 uppercase tracking-widest mt-1">Critical Condition</div>
                                    </div>
                                    <div className="bg-emerald-50 border border-emerald-200 p-5">
                                        <div className="text-3xl font-bold text-emerald-700">
                                            {inspectionReports.filter(r => r.status === 'scheduled').length}
                                        </div>
                                        <div className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest mt-1">Scheduled</div>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="bg-white border border-zinc-300 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                            <thead className="bg-black text-white font-bold uppercase text-[10px] tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-4">Inspection ID</th>
                                                    <th className="px-6 py-4">Truck & Mechanic</th>
                                                    <th className="px-6 py-4">Condition</th>
                                                    <th className="px-6 py-4">Issue Details</th>
                                                    <th className="px-6 py-4">Status</th>
                                                    <th className="px-6 py-4">Date</th>
                                                    <th className="px-6 py-4 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100">
                                                {paginatedInspections.map((inspection) => (
                                                    <tr key={inspection.id} className="hover:bg-zinc-50 transition-colors">
                                                        <td className="px-6 py-4 font-semibold text-zinc-900">
                                                            #{inspection.id}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-zinc-800">{inspection.truck?.unique_id || 'N/A'}</span>
                                                                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">{inspection.mechanic?.name || 'Unknown Mechanic'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${getConditionColor(inspection.overall_condition)}`}>
                                                                {inspection.overall_condition || 'Good'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="max-w-[200px] whitespace-normal">
                                                                <p className="font-medium text-zinc-800 text-sm line-clamp-1">{inspection.issue_title || 'No issues'}</p>
                                                                <p className="text-xs text-zinc-500 font-medium line-clamp-1 mt-0.5">{inspection.issue_description || '-'}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(inspection.status)}`}>
                                                                {inspection.status || 'Pending'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs uppercase tracking-wide font-medium text-zinc-600">
                                                            {new Date(inspection.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            {(inspection.status === 'pending' || inspection.status === 'reviewed') && inspection.issue_title && (
                                                                <button
                                                                    onClick={() => handleScheduleMaintenance(inspection)}
                                                                    disabled={loading}
                                                                    className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white bg-zinc-900 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                                                                >
                                                                    Schedule Repair
                                                                </button>
                                                            )}
                                                            {inspection.status === 'pending' && !inspection.issue_title && (
                                                                <button
                                                                    onClick={() => handleUpdateInspectionStatus(inspection.id, 'reviewed')}
                                                                    disabled={loading}
                                                                    className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors disabled:opacity-50"
                                                                >
                                                                    Acknowledge
                                                                </button>
                                                            )}
                                                            {inspection.status === 'reviewed' && !inspection.issue_title && (
                                                                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-50 border border-zinc-200">
                                                                    Reviewed
                                                                </span>
                                                            )}
                                                            {inspection.status === 'scheduled' && (
                                                                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200">
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
                                                <div className="text-xs font-semibold uppercase tracking-widest text-zinc-400">No inspection reports found</div>
                                            </div>
                                        )}
                                    </div>
                                    <Pagination
                                        currentPage={inspectionsPage}
                                        totalPages={inspectionsTotalPages}
                                        onPageChange={setInspectionsPage}
                                        totalItems={inspectionReports.length}
                                        itemsPerPage={10}
                                    />
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
                            <div className="fixed inset-0 bg-black/40 transition-opacity" onClick={() => setShowScheduleModal(false)} />
                            
                            <div className="relative w-full max-w-2xl bg-white shadow-xl border border-zinc-200">
                                <div className="border-b border-zinc-200 bg-white px-6 py-5">
                                    <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Schedule Maintenance</h3>
                                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mt-1">Create maintenance schedule from inspection report #{selectedInspection.id}</p>
                                </div>
                                
                                <div className="px-6 py-6 space-y-6">
                                    {/* Inspection Details */}
                                    <div className="bg-zinc-50 p-5 border border-zinc-200">
                                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Inspection Details</h4>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-zinc-500 uppercase tracking-wider text-[10px]">Truck</span>
                                                <span className="font-semibold text-zinc-900">{selectedInspection.truck?.unique_id} - {selectedInspection.truck?.plate_number}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-zinc-500 uppercase tracking-wider text-[10px]">Condition</span>
                                                <span className={`font-bold px-2 py-1 text-[10px] uppercase tracking-widest border bg-white ${getConditionColor(selectedInspection.overall_condition).split(' ')[0]}`}>
                                                    {selectedInspection.overall_condition}
                                                </span>
                                            </div>
                                            {selectedInspection.issue_title && (
                                                <div className="pt-2 border-t border-zinc-200 mt-2">
                                                    <span className="font-semibold text-zinc-500 uppercase tracking-wider text-[10px] block mb-1">Issue</span>
                                                    <span className="font-semibold text-zinc-900">{selectedInspection.issue_title}</span>
                                                </div>
                                            )}
                                            {selectedInspection.issue_description && (
                                                <div className="pt-2">
                                                    <span className="font-semibold text-zinc-500 uppercase tracking-wider text-[10px] block mb-1">Description</span>
                                                    <div className="mt-1 text-zinc-700 bg-white p-3 border border-zinc-200 whitespace-pre-wrap font-medium text-sm">
                                                        {selectedInspection.issue_description}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Schedule Form */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5">Assign Mechanic</label>
                                            <select
                                                value={scheduleData.mechanic_id}
                                                onChange={(e) => setScheduleData({ ...scheduleData, mechanic_id: e.target.value })}
                                                className="w-full px-4 py-2 border border-zinc-300 focus:ring-0 focus:border-zinc-500 bg-white font-medium text-zinc-700 transition-colors"
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
                                                <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5">Repair Date</label>
                                                <input
                                                    type="date"
                                                    value={scheduleData.repair_date}
                                                    onChange={(e) => setScheduleData({ ...scheduleData, repair_date: e.target.value })}
                                                    className="w-full px-4 py-2 border border-zinc-300 focus:ring-0 focus:border-zinc-500 font-medium text-zinc-700 transition-colors"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5">Repair Time</label>
                                                <input
                                                    type="time"
                                                    value={scheduleData.repair_time}
                                                    onChange={(e) => setScheduleData({ ...scheduleData, repair_time: e.target.value })}
                                                    className="w-full px-4 py-2 border border-zinc-300 focus:ring-0 focus:border-zinc-500 font-medium text-zinc-700 transition-colors"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5">Repair Location</label>
                                            <input
                                                type="text"
                                                value={scheduleData.repair_location}
                                                onChange={(e) => setScheduleData({ ...scheduleData, repair_location: e.target.value })}
                                                placeholder="Enter repair location"
                                                className="w-full px-4 py-2 border border-zinc-300 focus:ring-0 focus:border-zinc-500 font-medium text-zinc-700 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-zinc-200 px-6 py-4 bg-zinc-50 flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowScheduleModal(false)}
                                        className="px-5 py-2 text-xs font-semibold uppercase tracking-widest text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmSchedule}
                                        disabled={loading}
                                        className="px-5 py-2 text-xs font-semibold uppercase tracking-widest text-white bg-zinc-900 hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
