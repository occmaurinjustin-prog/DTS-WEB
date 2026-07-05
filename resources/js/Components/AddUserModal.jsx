import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import FaceRegistrationSection from './FaceRegistrationSection';
import LoadingOverlay from './LoadingOverlay';

export default function AddUserModal({ show, onClose, onSuccess }) {
    const roles = [
        {
            value: 'office_staff',
            label: 'Office Staff',
            icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
            color: 'from-slate-800 to-slate-900',
            description: 'Handle administrative tasks'
        },
        {
            value: 'operation_manager',
            label: 'Operation Manager',
            icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
            color: 'from-slate-700 to-slate-800',
            description: 'Manage operations and deliveries'
        },
        {
            value: 'driver',
            label: 'Driver',
            icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
            color: 'from-emerald-500 to-teal-500',
            description: 'Handle deliveries and transport'
        },
        {
            value: 'mechanic',
            label: 'Mechanic',
            icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
            color: 'from-emerald-600 to-teal-700',
            description: 'Maintain and repair fleet vehicles'
        },
    ];

    const [selectedRoleValue, setSelectedRoleValue] = useState(roles[0].value);
    const selectedRole = roles.find(r => r.value === selectedRoleValue);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [images, setImages] = useState([]);
    
    const [formData, setFormData] = useState({
        username: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        phone: '',
        license_number: '',
        is_active: true,
    });

    if (!show) return null;

    const dataURLtoFile = (dataurl, filename) => {
        let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type:mime});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (selectedRole.value === 'mechanic' && images.length < 10) {
            alert('Please complete face registration with 10 captures.');
            return;
        }

        setIsSubmitting(true);
        setLoadingMessage('Creating user account...');

        try {
            const submitData = {
                ...formData,
                role: selectedRole.value,
                is_active: formData.is_active ? 1 : 0,
            };

            // If mechanic and images are ready, send everything in one FormData request
            if (selectedRole.value === 'mechanic' && images.length === 10) {
                setLoadingMessage('Uploading face encodings...');
                const formDataPayload = new FormData();
                Object.keys(submitData).forEach(key => {
                    formDataPayload.append(key, submitData[key]);
                });
                images.forEach((imgSrc, index) => {
                    const file = dataURLtoFile(imgSrc, `capture_${index}.jpg`);
                    formDataPayload.append('images[]', file);
                });
                router.post('/admin/users', formDataPayload, {
                    forceFormData: true,
                    onSuccess: () => {
                        setIsSubmitting(false);
                        onSuccess();
                    },
                    onError: (errors) => {
                        console.error('Validation errors:', errors);
                        alert('Error creating user: ' + Object.values(errors).flat().join('\n'));
                        setIsSubmitting(false);
                    },
                });
                return;
            }

            // For non‑mechanic roles, simple post
            router.post('/admin/users', submitData, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSubmitting(false);
                    onSuccess();
                },
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                    alert('Error creating user: ' + Object.values(errors).flat().join('\n'));
                    setIsSubmitting(false);
                },
            });
        } catch (errors) {
            console.error('Error in form submission:', errors);
            if (errors) alert('Error: ' + Object.values(errors).flat().join('\n'));
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 py-6">
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose}></div>
                <div className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden border border-slate-100">
                    {isSubmitting && <LoadingOverlay message={loadingMessage} />}
                    
                    <div className="relative flex items-center justify-between px-8 py-6 border-b border-slate-100">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 bg-gradient-to-br ${selectedRole.color} rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10`}>
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={selectedRole.icon} />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Add {selectedRole.label}</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Register new system user</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
                        {/* Role Selection */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">User Role</h4>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Role <span className="text-red-500">*</span></label>
                                <select 
                                    value={selectedRoleValue} 
                                    onChange={(e) => setSelectedRoleValue(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                                >
                                    {roles.map(role => (
                                        <option key={role.value} value={role.value}>{role.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Basic Fields */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Full Name</h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">First Name <span className="text-red-500">*</span></label>
                                    <input type="text" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-emerald-300 focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Middle Name</label>
                                    <input type="text" value={formData.middle_name} onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-emerald-300 focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Last Name <span className="text-red-500">*</span></label>
                                    <input type="text" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-emerald-300 focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" required />
                                </div>
                            </div>
                        </div>

                        {/* Account Details */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Account Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Username <span className="text-red-500">*</span></label>
                                    <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-emerald-300 focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Email Address <span className="text-red-500">*</span></label>
                                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-emerald-300 focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-emerald-300 focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" required />
                                </div>
                            </div>
                            <p className="text-xs text-amber-600 font-medium">A temporary password will be automatically generated and sent to this email address.</p>
                        </div>



                        {selectedRole.value === 'driver' && (
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Driver Information</h4>
                                <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">License Number <span className="text-red-500">*</span></label>
                                        <input type="text" value={formData.license_number} onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-emerald-300 focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" placeholder="DL123456" required />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* FACE REGISTRATION SECTION FOR MECHANIC */}
                        {selectedRole.value === 'mechanic' && (
                            <FaceRegistrationSection images={images} setImages={setImages} />
                        )}

                        <div className="flex items-center pt-2">
                            <input type="checkbox" id="is_active" checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="w-5 h-5 text-[#10B981] border-slate-300 rounded-lg focus:ring-emerald-500 focus:ring-2 cursor-pointer" />
                            <label htmlFor="is_active" className="ml-3 text-xs font-semibold text-slate-700 cursor-pointer select-none">Active User Account</label>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                            <button type="button" onClick={onClose}
                                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all">
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={selectedRole.value === 'mechanic' && images.length < 10}
                                className="px-4 py-2 text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] disabled:bg-slate-300 rounded-lg shadow-md transition-all"
                            >
                                {selectedRole.value === 'mechanic' ? 'Create Mechanic' : 'Create User'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
