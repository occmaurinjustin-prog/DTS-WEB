import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import OperationalManagerLayout from '../../Layouts/OperationalManagerLayout';
import LocationPickerModal from '../../Components/LocationPickerModal';

export default function CreateDelivery({ authUser, clients, drivers, trucks, flash }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedTruck, setSelectedTruck] = useState(null);
    const [pickupModalOpen, setPickupModalOpen] = useState(false);
    const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        client_id: '',
        driver_id: '',
        item_description: '',
        waybill: '',
        pickup_address: '',
        delivery_address: '',
        weight_tons: '',
        priority: 'normal',
        estimated_delivery_date: '',
        truck_id: '',
        pickup_coordinates: '',
        dropoff_coordinates: '',
        notes: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        post('/operational-manager/deliveries', {
            onSuccess: () => {
                reset();
                setCurrentStep(1);
                setIsSubmitting(false);
                if (flash?.success) {
                    alert('Delivery request submitted successfully! It will be reviewed by admin.');
                }
            },
            onError: (errors) => {
                console.log('Submission error:', errors);
                setIsSubmitting(false);
            }
        });
    };

    const handleClientChange = (e) => {
        const clientId = e.target.value;
        const selectedClient = clients?.find(c => (c.client_id || c.id) == clientId);
        
        setData(prev => ({
            ...prev,
            client_id: clientId,
            driver_id: selectedClient?.preferred_driver_id || prev.driver_id
        }));
    };

    const handleDriverChange = (e) => {
        const driverId = e.target.value;
        const selectedDriver = drivers?.find(d => (d.driver_id || d.id) == driverId);
        const truck = selectedDriver?.truck_id ? trucks?.find(t => (t.truck_id || t.id) == selectedDriver.truck_id) : null;
        
        setSelectedTruck(truck);
        
        let parsedCapacity = '';
        if (truck && truck.capacity) {
            parsedCapacity = String(truck.capacity).replace(/[^0-9.]/g, '');
        }
        
        setData(prev => ({
            ...prev,
            driver_id: driverId,
            truck_id: truck ? truck.truck_id || truck.id : '',
            weight_tons: parsedCapacity
        }));
    };

    const nextStep = (e) => {
        e.preventDefault();
        if (validateCurrentStep()) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => setCurrentStep(currentStep - 1);

    const validateCurrentStep = () => {
        switch (currentStep) {
            case 1: return data.item_description && data.client_id && data.driver_id;
            case 2: return data.pickup_address && data.delivery_address;
            case 3: return data.weight_tons && data.priority;
            default: return true;
        }
    };

    const handlePickupLocationConfirm = (location) => {
        setData(prev => ({
            ...prev,
            pickup_address: location.address,
            pickup_coordinates: location.coordinates
        }));
    };

    const handleDeliveryLocationConfirm = (location) => {
        setData(prev => ({
            ...prev,
            delivery_address: location.address,
            dropoff_coordinates: location.coordinates
        }));
    };

    const steps = [
        { num: 1, title: 'Basic Info', desc: 'Client & Driver' },
        { num: 2, title: 'Locations', desc: 'Pickup & Dropoff' },
        { num: 3, title: 'Details', desc: 'Weight & Date' },
        { num: 4, title: 'Review', desc: 'Final Check' }
    ];

    return (
        <OperationalManagerLayout title="Create Delivery Request" authUser={authUser}>
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Delivery</h1>
                        <p className="text-slate-500 mt-1 text-sm font-medium">Submit new delivery request for admin approval</p>
                    </div>
                    <button
                        onClick={() => router.visit('/operational-manager/deliveries')}
                        className="px-4 py-2 bg-white/60 border border-slate-200 backdrop-blur text-slate-700 rounded-xl hover:bg-white hover:shadow-sm transition-all font-medium text-sm flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Deliveries
                    </button>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4 animate-fade-in shadow-sm">
                        <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <p className="text-emerald-800 font-semibold">{flash.success}</p>
                    </div>
                )}

                {/* Premium Step Wizard */}
                <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl shadow-slate-200/40 rounded-3xl p-6 md:p-8">
                    
                    <div className="relative mb-12">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full hidden sm:block"></div>
                        <div 
                            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-emerald-400 to-[#4F46E5] -translate-y-1/2 rounded-full hidden sm:block transition-all duration-500 ease-out" 
                            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                        ></div>

                        <div className="relative flex flex-col sm:flex-row justify-between gap-4 sm:gap-0">
                            {steps.map((step) => (
                                <div key={step.num} className="flex sm:flex-col items-center gap-4 sm:gap-3 relative z-10">
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all duration-300 ${
                                        step.num < currentStep 
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                                            : step.num === currentStep 
                                                ? 'bg-[#4F46E5] text-white shadow-lg shadow-[#4F46E5]/40 ring-4 ring-[#4F46E5]/20' 
                                                : 'bg-white border-2 border-slate-200 text-slate-400'
                                    }`}>
                                        {step.num < currentStep ? (
                                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                        ) : (
                                            step.num
                                        )}
                                    </div>
                                    <div className="sm:text-center">
                                        <p className={`font-bold text-sm ${step.num <= currentStep ? 'text-slate-900' : 'text-slate-400'}`}>{step.title}</p>
                                        <p className={`text-xs font-medium ${step.num <= currentStep ? 'text-slate-500' : 'text-slate-400'}`}>{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Area */}
                    <form onSubmit={handleSubmit} className="mt-8 transition-all duration-300">
                        
                        {/* Step 1: Basic Information */}
                        <div className={currentStep === 1 ? 'block animate-fade-in' : 'hidden'}>
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#4F46E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                Request Details
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Item Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={data.item_description}
                                        onChange={(e) => setData('item_description', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all resize-none shadow-sm"
                                        placeholder="Describe the items, quantity, and dimensions"
                                        required
                                    />
                                    {errors.item_description && <p className="mt-1 text-sm text-red-600 font-medium">{errors.item_description}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Client <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.client_id}
                                            onChange={handleClientChange}
                                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all shadow-sm font-medium text-slate-700"
                                            required
                                        >
                                            <option value="">Select Client...</option>
                                            {clients?.map((client) => (
                                                <option key={`client-${client.id || client.client_id}`} value={client.id || client.client_id}>
                                                    {client.client_name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.client_id && <p className="mt-1 text-sm text-red-600 font-medium">{errors.client_id}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Driver <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.driver_id}
                                            onChange={handleDriverChange}
                                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all shadow-sm font-medium text-slate-700"
                                            required
                                        >
                                            <option value="">Select Driver...</option>
                                            {drivers?.map((driver) => {
                                                const isAvailable = driver.availability_status === 'available';
                                                return (
                                                    <option key={`driver-${driver.id || driver.driver_id}`} value={driver.id || driver.driver_id} disabled={!isAvailable}>
                                                        {driver.user?.firstname} {driver.user?.lastname} {!isAvailable ? '(Busy)' : ''}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                        {errors.driver_id && <p className="mt-1 text-sm text-red-600 font-medium">{errors.driver_id}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            WayBill
                                        </label>
                                        <input
                                            type="text"
                                            value={data.waybill}
                                            onChange={(e) => setData('waybill', e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all shadow-sm font-medium"
                                            placeholder="e.g. WB-12345"
                                        />
                                        {errors.waybill && <p className="mt-1 text-sm text-red-600 font-medium">{errors.waybill}</p>}
                                    </div>
                                </div>

                                {selectedTruck && (
                                    <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between animate-fade-in shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Auto-Assigned Truck</p>
                                                <p className="text-sm font-semibold text-emerald-900 mt-0.5">
                                                    {selectedTruck.truck_model} <span className="text-emerald-700 font-medium border border-emerald-200 bg-emerald-100/50 px-2 py-0.5 rounded ml-2">{selectedTruck.plate_number}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Step 2: Location Details */}
                        <div className={currentStep === 2 ? 'block animate-fade-in' : 'hidden'}>
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#4F46E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                Routing Details
                            </h3>
                            <div className="space-y-6">
                                {/* Pickup Location */}
                                <div className="group bg-slate-50/50 p-4 rounded-2xl border border-slate-200 focus-within:bg-white focus-within:border-[#4F46E5] focus-within:ring-2 focus-within:ring-[#4F46E5]/20 transition-all shadow-sm">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Pickup Location <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="flex-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.2)]"></div>
                                            </div>
                                            <input
                                                type="text"
                                                value={data.pickup_address}
                                                readOnly
                                                placeholder="Select pickup point on map..."
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none transition-all text-slate-900 font-medium cursor-not-allowed"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setPickupModalOpen(true)}
                                            className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-md hover:shadow-lg shadow-emerald-500/20 font-bold whitespace-nowrap flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                                            Select Map
                                        </button>
                                    </div>
                                    {errors.pickup_address && <p className="mt-2 text-sm text-red-600 font-medium">{errors.pickup_address}</p>}
                                </div>

                                {/* Delivery Location */}
                                <div className="group bg-slate-50/50 p-4 rounded-2xl border border-slate-200 focus-within:bg-white focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20 transition-all shadow-sm">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Delivery Location <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="flex-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.2)]"></div>
                                            </div>
                                            <input
                                                type="text"
                                                value={data.delivery_address}
                                                readOnly
                                                placeholder="Select drop-off point on map..."
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none transition-all text-slate-900 font-medium cursor-not-allowed"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setDeliveryModalOpen(true)}
                                            className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-md hover:shadow-lg shadow-red-500/20 font-bold whitespace-nowrap flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                                            Select Map
                                        </button>
                                    </div>
                                    {errors.delivery_address && <p className="mt-2 text-sm text-red-600 font-medium">{errors.delivery_address}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Step 3: Details */}
                        <div className={currentStep === 3 ? 'block animate-fade-in' : 'hidden'}>
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#4F46E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                Delivery Requirements
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-6">
                                    <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200">
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                            Weight (tons) <span className="text-red-500">*</span>
                                            {selectedTruck && <span className="text-[10px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full ml-auto">Auto-Filled</span>}
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                                            </div>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                value={data.weight_tons}
                                                onChange={(e) => setData('weight_tons', e.target.value)}
                                                className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all font-medium text-slate-900 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${selectedTruck ? 'bg-emerald-50/30 border-emerald-200' : 'bg-white border-slate-300'}`}
                                                style={{ MozAppearance: 'textfield' }}
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                        {errors.weight_tons && <p className="mt-2 text-sm text-red-600 font-medium">{errors.weight_tons}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Priority Level <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.priority}
                                            onChange={(e) => setData('priority', e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all font-medium text-slate-900 shadow-sm"
                                            required
                                        >
                                            <option value="normal">🟢 Normal Priority</option>
                                            <option value="high">🟡 High Priority</option>
                                            <option value="urgent">🔴 Urgent / Expedited</option>
                                        </select>
                                        {errors.priority && <p className="mt-2 text-sm text-red-600 font-medium">{errors.priority}</p>}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Estimated Delivery Date
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                            <input
                                                type="date"
                                                value={data.estimated_delivery_date}
                                                onChange={(e) => setData('estimated_delivery_date', e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all font-medium text-slate-900 shadow-sm"
                                            />
                                        </div>
                                        <p className="mt-2 text-xs text-slate-500 font-medium">Select the target date for completion.</p>
                                        {errors.estimated_delivery_date && <p className="mt-2 text-sm text-red-600 font-medium">{errors.estimated_delivery_date}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 4: Review & Submit */}
                        <div className={currentStep === 4 ? 'block animate-fade-in' : 'hidden'}>
                            
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 flex items-start gap-4">
                                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-amber-900 text-lg">Final Verification</h4>
                                    <p className="text-sm text-amber-800 font-medium mt-1 leading-relaxed">
                                        Please review the details below. Once submitted, this request will be sent to Administration for final approval before being dispatched to the driver.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Basic Summary */}
                                <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Request Basics</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-500">Item Description</p>
                                                <p className="text-slate-900 font-bold mt-0.5">{data.item_description || 'Not specified'}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-start gap-3">
                                            <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-500">Client</p>
                                                <p className="text-slate-900 font-bold mt-0.5">{clients?.find(c => c.id == data.client_id)?.client_name || 'Not selected'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-500">Assigned Driver & Truck</p>
                                                <p className="text-slate-900 font-bold mt-0.5">
                                                    {drivers?.find(d => d.id == data.driver_id)?.user?.firstname} {drivers?.find(d => d.id == data.driver_id)?.user?.lastname}
                                                </p>
                                                {selectedTruck && <p className="text-sm text-emerald-600 font-semibold mt-1">{selectedTruck.truck_model} • {selectedTruck.plate_number}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Logistics Summary */}
                                <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Logistics details</h4>
                                    <div className="space-y-4">
                                        
                                        <div className="relative">
                                            {/* Routing visual line */}
                                            <div className="absolute left-2.5 top-6 bottom-6 w-0.5 bg-slate-200 rounded-full"></div>
                                            
                                            <div className="flex items-start gap-3 mb-5">
                                                <div className="w-5 h-5 rounded-full bg-emerald-100 border-2 border-emerald-500 shrink-0 mt-0.5 z-10"></div>
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-500">Pickup Location</p>
                                                    <p className="text-slate-900 font-bold mt-0.5 leading-tight">{data.pickup_address || 'Not specified'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-5 h-5 rounded-full bg-red-100 border-2 border-red-500 shrink-0 mt-0.5 z-10"></div>
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-500">Delivery Location</p>
                                                    <p className="text-slate-900 font-bold mt-0.5 leading-tight">{data.delivery_address || 'Not specified'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-200 my-4 pt-4"></div>

                                        <div className="flex gap-6">
                                            <div className="flex-1">
                                                <p className="text-xs font-semibold text-slate-500">Weight & Priority</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="font-bold text-slate-900">{data.weight_tons || '0'} tons</span>
                                                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${data.priority === 'urgent' ? 'bg-red-100 text-red-700' : data.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'}`}>
                                                        {data.priority}
                                                    </span>
                                                </div>
                                            </div>
                                            {data.estimated_delivery_date && (
                                                <div className="flex-1">
                                                    <p className="text-xs font-semibold text-slate-500">Target Date</p>
                                                    <p className="font-bold text-slate-900 mt-1">{new Date(data.estimated_delivery_date).toLocaleDateString()}</p>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between pt-8 mt-10 border-t border-slate-100">
                            <div>
                                {currentStep > 1 ? (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all font-bold shadow-sm"
                                    >
                                        Back
                                    </button>
                                ) : (
                                    <div className="px-6 py-3 invisible">Placeholder</div>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-4">
                                {currentStep < 4 ? (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={!validateCurrentStep()}
                                        className="px-8 py-3 bg-[#4F46E5] text-white rounded-xl hover:bg-[#4338CA] transition-all font-bold shadow-md hover:shadow-lg shadow-[#4F46E5]/30 disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                                    >
                                        Continue
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={processing || isSubmitting}
                                        className="px-8 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all font-bold shadow-md hover:shadow-lg shadow-emerald-500/30 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {(processing || isSubmitting) ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Submitting Request...
                                            </>
                                        ) : (
                                            <>
                                                Submit for Approval
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Location Picker Modals */}
                <LocationPickerModal
                    isOpen={pickupModalOpen}
                    onClose={() => setPickupModalOpen(false)}
                    onConfirm={handlePickupLocationConfirm}
                    type="pickup"
                    initialLocation={data.pickup_coordinates}
                />

                <LocationPickerModal
                    isOpen={deliveryModalOpen}
                    onClose={() => setDeliveryModalOpen(false)}
                    onConfirm={handleDeliveryLocationConfirm}
                    type="delivery"
                    initialLocation={data.dropoff_coordinates}
                />
            </div>
        </OperationalManagerLayout>
    );
}
