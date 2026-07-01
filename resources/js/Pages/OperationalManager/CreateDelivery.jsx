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
        console.log('Form submitted');
        console.log('Processing state:', processing);
        console.log('IsSubmitting state:', isSubmitting);
        console.log('Window Ziggy:', window.Ziggy);
        
        // Debug the route function
        try {
            const routeUrl = route('operational_manager.deliveries.store');
            console.log('Generated route URL:', routeUrl);
        } catch (error) {
            console.error('Route generation error:', error);
        }
        
        setIsSubmitting(true);
        
        post('/operational-manager/deliveries', {
            onSuccess: () => {
                console.log('Submission successful');
                reset();
                setCurrentStep(1);
                setIsSubmitting(false);
                // Show success message
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
        setData('client_id', clientId);
        
        // Auto-select driver if client has preferred driver
        const selectedClient = clients?.find(c => (c.client_id || c.id) == clientId);
        if (selectedClient?.preferred_driver_id) {
            setData('driver_id', selectedClient.preferred_driver_id);
        }
    };

    const handleDriverChange = (e) => {
        const driverId = e.target.value;
        setData('driver_id', driverId);
        
        // Auto-select truck based on driver
        const selectedDriver = drivers?.find(d => (d.driver_id || d.id) == driverId);
        if (selectedDriver?.truck_id) {
            const truck = trucks?.find(t => (t.truck_id || t.id) == selectedDriver.truck_id);
            setSelectedTruck(truck);
            setData('truck_id', selectedDriver.truck_id);
        } else {
            setSelectedTruck(null);
            setData('truck_id', '');
        }
    };

    const nextStep = (e) => {
        e.preventDefault();
        console.log('NextStep clicked, current step:', currentStep);
        const isValid = validateCurrentStep();
        console.log('Step validation result:', isValid);
        
        if (isValid) {
            const newStep = currentStep + 1;
            console.log('Moving to step:', newStep);
            setCurrentStep(newStep);
        } else {
            console.log('Step validation failed, staying on step:', currentStep);
        }
    };

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
    };

    const validateCurrentStep = () => {
        console.log('Validating step:', currentStep);
        console.log('Form data:', data);
        
        switch (currentStep) {
            case 1:
                const step1Valid = data.item_description && data.client_id && data.driver_id;
                console.log('Step 1 valid:', step1Valid);
                return step1Valid;
            case 2:
                const step2Valid = data.pickup_address && data.delivery_address;
                console.log('Step 2 valid:', step2Valid);
                return step2Valid;
            case 3:
                const step3Valid = data.weight_tons && data.priority;
                console.log('Step 3 valid:', step3Valid);
                return step3Valid;
            default:
                return true;
        }
    };

    const handlePickupLocationConfirm = (location) => {
        setData('pickup_address', location.address);
        setData('pickup_coordinates', location.coordinates);
    };

    const handleDeliveryLocationConfirm = (location) => {
        setData('delivery_address', location.address);
        setData('dropoff_coordinates', location.coordinates);
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case 1: return 'Basic Information';
            case 2: return 'Location Details';
            case 3: return 'Additional Details';
            case 4: return 'Review & Submit';
            default: return '';
        }
    };

    return (
        <OperationalManagerLayout title="Create Delivery Request" authUser={authUser}>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Create Delivery Request</h1>
                        <p className="text-slate-500 mt-0.5 text-sm">Submit new delivery request for admin approval</p>
                    </div>
                    <button
                        onClick={() => router.visit('/operational-manager/deliveries')}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                        Back to Deliveries
                    </button>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-emerald-800 font-medium">{flash.success}</p>
                    </div>
                )}

                {/* Progress Indicator */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">{getStepTitle()}</h2>
                        <span className="text-sm text-slate-500">Step {currentStep} of 4</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4].map((step) => (
                            <React.Fragment key={step}>
                                <div
                                    className={`flex-1 h-2 rounded-full transition-colors ${
                                        step <= currentStep ? 'bg-[#4F46E5]' : 'bg-slate-200'
                                    }`}
                                />
                                {step < 4 && (
                                    <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                                            step < currentStep
                                                ? 'bg-[#4F46E5] text-white'
                                                : step === currentStep
                                                ? 'bg-[#4F46E5] text-white ring-2 ring-[#4F46E5]/20'
                                                : 'bg-slate-200 text-slate-500'
                                        }`}
                                    >
                                        {step}
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/60">
                    <form onSubmit={handleSubmit} className="p-6">
                        {/* Step 1: Basic Information */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Item Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={data.item_description}
                                        onChange={(e) => setData('item_description', e.target.value)}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all resize-none"
                                        placeholder="Describe the items being delivered"
                                        required
                                    />
                                    {errors.item_description && (
                                        <p className="mt-1 text-sm text-red-600">{errors.item_description}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Client <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.client_id}
                                            onChange={handleClientChange}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
                                            required
                                        >
                                            <option key="placeholder-client" value="">Select a client</option>
                                            {clients?.map((client) => (
                                                <option key={`client-${client.id || client.client_id}`} value={client.id || client.client_id}>
                                                    {client.client_name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.client_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.client_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Driver <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.driver_id}
                                            onChange={handleDriverChange}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
                                            required
                                        >
                                            <option key="placeholder-driver" value="">Select a driver</option>
                                            {drivers?.map((driver) => {
                                                const isAvailable = driver.availability_status === 'available';
                                                return (
                                                    <option 
                                                        key={`driver-${driver.id || driver.driver_id}`} 
                                                        value={driver.id || driver.driver_id}
                                                        disabled={!isAvailable}
                                                    >
                                                        {driver.user?.firstname} {driver.user?.lastname} {!isAvailable ? '(Busy)' : ''}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                        {errors.driver_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.driver_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            WayBill
                                        </label>
                                        <input
                                            type="text"
                                            value={data.waybill}
                                            onChange={(e) => setData('waybill', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
                                            placeholder="Enter waybill number"
                                        />
                                        {errors.waybill && (
                                            <p className="mt-1 text-sm text-red-600">{errors.waybill}</p>
                                        )}
                                    </div>
                                </div>

                                {selectedTruck && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 text-green-800">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="font-medium">Truck Assigned:</span>
                                            <span>{selectedTruck.truck_model} ({selectedTruck.plate_number})</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Location Details */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                {/* Pickup Location */}
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Pickup Location <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.pickup_address}
                                            readOnly
                                            placeholder="Click MAP to select pickup location"
                                            className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-slate-900 cursor-not-allowed"
                                        />
                                        {errors.pickup_address && (
                                            <p className="mt-1 text-sm text-red-600">{errors.pickup_address}</p>
                                        )}
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            type="button"
                                            onClick={() => setPickupModalOpen(true)}
                                            className="px-6 py-3 bg-[#16A34A] text-white rounded-xl hover:bg-[#15803d] transition-all shadow-md hover:shadow-lg font-medium min-w-[100px]"
                                        >
                                            MAP
                                        </button>
                                    </div>
                                </div>

                                {/* Delivery Location */}
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Delivery Location <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.delivery_address}
                                            readOnly
                                            placeholder="Click MAP to select delivery location"
                                            className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-slate-900 cursor-not-allowed"
                                        />
                                        {errors.delivery_address && (
                                            <p className="mt-1 text-sm text-red-600">{errors.delivery_address}</p>
                                        )}
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            type="button"
                                            onClick={() => setDeliveryModalOpen(true)}
                                            className="px-6 py-3 bg-[#EF4444] text-white rounded-xl hover:bg-[#dc2626] transition-all shadow-md hover:shadow-lg font-medium min-w-[100px]"
                                        >
                                            MAP
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Weight (tons) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={data.weight_tons}
                                            onChange={(e) => setData('weight_tons', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
                                            placeholder="0.00"
                                            required
                                        />
                                        {errors.weight_tons && (
                                            <p className="mt-1 text-sm text-red-600">{errors.weight_tons}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Priority Level <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.priority}
                                            onChange={(e) => setData('priority', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
                                            required
                                        >
                                            <option key="normal" value="normal">Normal</option>
                                            <option key="high" value="high">High</option>
                                            <option key="urgent" value="urgent">Urgent</option>
                                        </select>
                                        {errors.priority && (
                                            <p className="mt-1 text-sm text-red-600">{errors.priority}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Estimated Delivery Date
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={data.estimated_delivery_date}
                                        onChange={(e) => setData('estimated_delivery_date', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
                                    />
                                    {errors.estimated_delivery_date && (
                                        <p className="mt-1 text-sm text-red-600">{errors.estimated_delivery_date}</p>
                                    )}
                                </div>

                                                            </div>
                        )}

                        {/* Step 4: Review & Submit */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Review Delivery Details</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-500 mb-1">Item Description</h4>
                                            <p className="text-slate-900">{data.item_description || 'Not specified'}</p>
                                        </div>
                                        
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-500 mb-1">Client</h4>
                                            <p className="text-slate-900">
                                                {clients?.find(c => c.id == data.client_id)?.client_name || 'Not selected'}
                                            </p>
                                        </div>
                                        
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-500 mb-1">Driver</h4>
                                            <p className="text-slate-900">
                                                {drivers?.find(d => d.id == data.driver_id)?.user?.firstname + ' ' + 
                                                 drivers?.find(d => d.id == data.driver_id)?.user?.lastname || 'Not selected'}
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-slate-500 mb-1">WayBill</h4>
                                            <p className="text-slate-900">{data.waybill || 'Not specified'}</p>
                                        </div>
                                        
                                        {selectedTruck && (
                                            <div>
                                                <h4 className="text-sm font-medium text-slate-500 mb-1">Assigned Truck</h4>
                                                <p className="text-slate-900">
                                                    {selectedTruck.truck_model} ({selectedTruck.plate_number})
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-500 mb-1">Pickup Address</h4>
                                            <p className="text-slate-900">{data.pickup_address || 'Not specified'}</p>
                                        </div>
                                        
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-500 mb-1">Delivery Address</h4>
                                            <p className="text-slate-900">{data.delivery_address || 'Not specified'}</p>
                                        </div>
                                        
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-500 mb-1">Weight & Priority</h4>
                                            <p className="text-slate-900">
                                                {data.weight_tons || '0'} tons - {data.priority || 'normal'} priority
                                            </p>
                                        </div>
                                        
                                        {data.estimated_delivery_date && (
                                            <div>
                                                <h4 className="text-sm font-medium text-slate-500 mb-1">Estimated Delivery</h4>
                                                <p className="text-slate-900">
                                                    {new Date(data.estimated_delivery_date).toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                                                
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <div>
                                            <h4 className="font-medium text-amber-900">Submission Confirmation</h4>
                                            <p className="text-sm text-amber-800 mt-1">
                                                Once submitted, this delivery request will be sent for admin approval. 
                                                You'll be able to track the status from the Deliveries page.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-8">
                            <div>
                                {currentStep > 1 && (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                                    >
                                        Previous
                                    </button>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-4">
                                {currentStep < 4 ? (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={!validateCurrentStep()}
                                        className="px-6 py-2.5 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next Step
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={processing || isSubmitting}
                                        className="px-6 py-2.5 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {(processing || isSubmitting) ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Submitting...
                                            </>
                                        ) : (
                                            'Submit for Approval'
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Info Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-blue-900 mb-1">Approval Process</h3>
                            <p className="text-sm text-blue-800">
                                Your delivery request will be submitted for admin review. Once approved, it will be assigned to the selected driver and they will receive notification. You can track the status from the Deliveries page.
                            </p>
                        </div>
                    </div>
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

