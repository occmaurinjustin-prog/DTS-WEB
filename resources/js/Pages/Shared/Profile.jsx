import React, { useState, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import OperationalManagerLayout from '../../Layouts/OperationalManagerLayout';
import OfficeStaffLayout from '../../Layouts/OfficeStaffLayout';
import PurchaserLayout from '../../Layouts/PurchaserLayout';
import BillingLayout from '../../Layouts/BillingLayout';

// Dynamic Layout Resolver
const LayoutWrapper = ({ layoutType, authUser, children }) => {
    switch (layoutType) {
        case 'AdminLayout': return <AdminLayout title="Profile" authUser={authUser} activeMenu="profile">{children}</AdminLayout>;
        case 'OperationalManagerLayout': return <OperationalManagerLayout title="Profile" authUser={authUser} activeMenu="profile">{children}</OperationalManagerLayout>;
        case 'OfficeStaffLayout': return <OfficeStaffLayout title="Profile" authUser={authUser} activeMenu="profile">{children}</OfficeStaffLayout>;
        case 'PurchaserLayout': return <PurchaserLayout title="Profile" authUser={authUser} activeMenu="profile">{children}</PurchaserLayout>;
        case 'BillingLayout': return <BillingLayout title="Profile" authUser={authUser} activeMenu="profile">{children}</BillingLayout>;
        default: return <AdminLayout title="Profile" authUser={authUser} activeMenu="profile">{children}</AdminLayout>;
    }
};

export default function Profile({ authUser, layoutType, flash }) {
    const fileInputRef = useRef(null);
    const [previewImage, setPreviewImage] = useState(authUser.profile_image || null);
    
    const { data: infoData, setData: setInfoData, post: postInfo, processing: infoProcessing, errors: infoErrors } = useForm({
        firstname: authUser.firstname || '',
        lastname: authUser.lastname || '',
        email: authUser.email || '',
        contact_number: authUser.contact_number || '',
    });

    const { data: picData, setData: setPicData, post: postPic, processing: picProcessing, errors: picErrors } = useForm({
        profile_image: null,
    });

    const { data: passData, setData: setPassData, post: postPass, processing: passProcessing, errors: passErrors, reset: resetPass } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleInfoSubmit = (e) => {
        e.preventDefault();
        postInfo('/profile/information');
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        postPass('/profile/password', {
            onSuccess: () => resetPass(),
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPicData('profile_image', file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const uploadPicture = () => {
        postPic('/profile/picture', {
            onSuccess: () => setPicData('profile_image', null)
        });
    };

    return (
        <LayoutWrapper layoutType={layoutType} authUser={authUser}>
            <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fade-in">
                
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#4338CA] flex items-center justify-center shadow-lg shadow-[#4F46E5]/20">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Profile Settings</h1>
                        <p className="text-sm font-medium text-slate-500">Manage your account details and security</p>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <p className="text-emerald-800 font-semibold">{flash.success}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Avatar & Basic Stats */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 p-6 flex flex-col items-center text-center">
                            
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl shadow-slate-200/50 bg-slate-100 mb-4 transition-transform group-hover:scale-105">
                                    {previewImage ? (
                                        <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[#4F46E5] to-[#818cf8] flex items-center justify-center">
                                            <span className="text-4xl font-black text-white tracking-widest uppercase">
                                                {authUser.firstname?.charAt(0)}{authUser.lastname?.charAt(0)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity mb-4">
                                    <svg className="w-8 h-8 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <span className="text-white text-xs font-bold">Change</span>
                                </div>
                            </div>

                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            
                            {picData.profile_image && (
                                <button 
                                    onClick={uploadPicture} 
                                    disabled={picProcessing}
                                    className="mb-4 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-bold shadow-md hover:bg-emerald-600 disabled:opacity-50 transition-all"
                                >
                                    {picProcessing ? 'Saving...' : 'Save New Picture'}
                                </button>
                            )}
                            {picErrors.profile_image && <p className="text-xs text-red-600 mb-4">{picErrors.profile_image}</p>}

                            <h2 className="text-xl font-bold text-slate-900">{authUser.firstname} {authUser.lastname}</h2>
                            <p className="text-sm font-semibold text-[#4F46E5] uppercase tracking-wider mt-1">{authUser.role?.replace('_', ' ')}</p>
                            <p className="text-sm text-slate-500 mt-1">{authUser.email}</p>
                            
                        </div>

                        <div className="bg-slate-50/80 rounded-3xl border border-slate-200 p-6">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Account Status</h3>
                            <div className="flex items-center justify-between py-2 border-b border-slate-200">
                                <span className="text-sm font-medium text-slate-600">Status</span>
                                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold uppercase">Active</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm font-medium text-slate-600">Joined</span>
                                <span className="text-sm font-bold text-slate-900">{new Date(authUser.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Forms */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Personal Information */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
                            <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="text-lg font-bold text-slate-800">Personal Information</h3>
                            </div>
                            <form onSubmit={handleInfoSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">First Name</label>
                                        <input 
                                            type="text" 
                                            value={infoData.firstname}
                                            onChange={e => setInfoData('firstname', e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all font-medium"
                                        />
                                        {infoErrors.firstname && <p className="text-xs text-red-600 mt-1">{infoErrors.firstname}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Last Name</label>
                                        <input 
                                            type="text" 
                                            value={infoData.lastname}
                                            onChange={e => setInfoData('lastname', e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all font-medium"
                                        />
                                        {infoErrors.lastname && <p className="text-xs text-red-600 mt-1">{infoErrors.lastname}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                                        <input 
                                            type="email" 
                                            value={infoData.email}
                                            onChange={e => setInfoData('email', e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all font-medium"
                                        />
                                        {infoErrors.email && <p className="text-xs text-red-600 mt-1">{infoErrors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Number</label>
                                        <input 
                                            type="text" 
                                            value={infoData.contact_number}
                                            onChange={e => setInfoData('contact_number', e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all font-medium"
                                        />
                                        {infoErrors.contact_number && <p className="text-xs text-red-600 mt-1">{infoErrors.contact_number}</p>}
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button 
                                        type="submit" 
                                        disabled={infoProcessing}
                                        className="px-6 py-3 bg-[#4F46E5] text-white rounded-xl font-bold shadow-md hover:shadow-lg shadow-[#4F46E5]/30 hover:bg-[#4338CA] transition-all disabled:opacity-50"
                                    >
                                        {infoProcessing ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Security */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
                            <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="text-lg font-bold text-slate-800">Change Password</h3>
                            </div>
                            <form onSubmit={handlePasswordSubmit} className="p-8 space-y-6">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Password</label>
                                        <input 
                                            type="password" 
                                            value={passData.current_password}
                                            onChange={e => setPassData('current_password', e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all font-medium"
                                        />
                                        {passErrors.current_password && <p className="text-xs text-red-600 mt-1">{passErrors.current_password}</p>}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                                            <input 
                                                type="password" 
                                                value={passData.password}
                                                onChange={e => setPassData('password', e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all font-medium"
                                            />
                                            {passErrors.password && <p className="text-xs text-red-600 mt-1">{passErrors.password}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                                            <input 
                                                type="password" 
                                                value={passData.password_confirmation}
                                                onChange={e => setPassData('password_confirmation', e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button 
                                        type="submit" 
                                        disabled={passProcessing}
                                        className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold shadow-md hover:bg-slate-900 transition-all disabled:opacity-50"
                                    >
                                        {passProcessing ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </LayoutWrapper>
    );
}
