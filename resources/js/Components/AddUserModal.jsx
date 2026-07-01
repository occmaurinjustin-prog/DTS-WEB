import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import FaceRegistrationSection from './FaceRegistrationSection';
import LoadingOverlay from './LoadingOverlay';

export default function AddUserModal({ show, onClose, selectedRole, onSuccess }) {
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
        extension_no: '',
        is_active: true,
    });

    if (!show || !selectedRole) return null;

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

                        {selectedRole.value === 'office_staff' && (
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Work Details</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Extension</label>
                                        <input type="text" value={formData.extension_no} onChange={(e) => setFormData({ ...formData, extension_no: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-emerald-300 focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" placeholder="e.g. 101" />
                                    </div>
                                </div>
                            </div>
                        )}

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
