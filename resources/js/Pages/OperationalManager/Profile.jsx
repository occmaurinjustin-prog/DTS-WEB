import React from 'react';
import OperationalManagerLayout from '../../Layouts/OperationalManagerLayout';

export default function Profile({ authUser }) {
    return (
        <OperationalManagerLayout title="Profile" authUser={authUser} activeMenu="profile">
            <div className="max-w-4xl mx-auto space-y-4">
                {/* Premium Header */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shadow-md">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-base font-semibold text-gray-900">Profile Settings</h1>
                        <p className="text-xs text-gray-500">Manage your account information</p>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                    {/* Profile Header */}
                    <div className="px-4 py-4 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-gradient-to-br from-[#dc2626] to-[#f87171] rounded-xl flex items-center justify-center shadow-md">
                                <span className="text-white font-bold text-lg">
                                    {authUser?.username?.charAt(0)?.toUpperCase() || 'OM'}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">{authUser?.username || 'Operational Manager'}</h3>
                                <p className="text-xs text-[#dc2626] font-medium">Operations Department</p>
                                <p className="text-[10px] text-gray-500">{authUser?.email || 'operation@dts.com'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <form className="p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">First Name</label>
                                <input 
                                    type="text" 
                                    className="w-full px-2.5 py-1.5 bg-[#f8fafc] border border-gray-200 rounded-lg text-xs text-gray-700 hover:border-gray-300 focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/10 focus:bg-white transition-all outline-none" 
                                    defaultValue={authUser?.information?.firstname || 'John'} 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Last Name</label>
                                <input 
                                    type="text" 
                                    className="w-full px-2.5 py-1.5 bg-[#f8fafc] border border-gray-200 rounded-lg text-xs text-gray-700 hover:border-gray-300 focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/10 focus:bg-white transition-all outline-none" 
                                    defaultValue={authUser?.information?.lastname || 'Manager'} 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</label>
                                <input 
                                    type="email" 
                                    className="w-full px-2.5 py-1.5 bg-[#f8fafc] border border-gray-200 rounded-lg text-xs text-gray-700 hover:border-gray-300 focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/10 focus:bg-white transition-all outline-none" 
                                    defaultValue={authUser?.email || 'operation@dts.com'} 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone</label>
                                <input 
                                    type="tel" 
                                    className="w-full px-2.5 py-1.5 bg-[#f8fafc] border border-gray-200 rounded-lg text-xs text-gray-700 hover:border-gray-300 focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/10 focus:bg-white transition-all outline-none" 
                                    defaultValue={authUser?.information?.contact_number || '+63 912 345 6789'} 
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Department</label>
                            <input 
                                type="text" 
                                className="w-full px-2.5 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-600 cursor-not-allowed" 
                                defaultValue="Operations" 
                                readOnly 
                            />
                        </div>
                    </form>
                </div>

                {/* Change Password Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-100">
                        <h4 className="text-xs font-semibold text-gray-700">Change Password</h4>
                    </div>
                    <form className="p-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Current Password</label>
                                <input 
                                    type="password" 
                                    className="w-full px-2.5 py-1.5 bg-[#f8fafc] border border-gray-200 rounded-lg text-xs text-gray-700 hover:border-gray-300 focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/10 focus:bg-white transition-all outline-none" 
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div className="hidden md:block"></div>
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">New Password</label>
                                <input 
                                    type="password" 
                                    className="w-full px-2.5 py-1.5 bg-[#f8fafc] border border-gray-200 rounded-lg text-xs text-gray-700 hover:border-gray-300 focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/10 focus:bg-white transition-all outline-none" 
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Confirm Password</label>
                                <input 
                                    type="password" 
                                    className="w-full px-2.5 py-1.5 bg-[#f8fafc] border border-gray-200 rounded-lg text-xs text-gray-700 hover:border-gray-300 focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/10 focus:bg-white transition-all outline-none" 
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button 
                                type="submit" 
                                className="px-4 py-2 bg-gradient-to-r from-[#dc2626] to-[#f87171] text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                            >
                                Update Profile
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </OperationalManagerLayout>
    );
}
