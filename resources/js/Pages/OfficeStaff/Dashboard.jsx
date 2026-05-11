import React from 'react';
import OfficeStaffLayout from '../../Layouts/OfficeStaffLayout';

export default function Dashboard({ authUser, userInfo, officeStaff, stats, recentInquiries, myInquiries }) {
    return (
        <OfficeStaffLayout title="Dashboard" authUser={authUser} activeMenu="dashboard">
            <DashboardContent stats={stats} recentInquiries={recentInquiries} myInquiries={myInquiries} />
        </OfficeStaffLayout>
    );
}

// Dashboard Content Component
function DashboardContent({ stats, recentInquiries, myInquiries }) {
    return (
        <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button className="card-hover bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl p-4 shadow-lg flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <div className="text-left">
                        <p className="font-semibold">New Inquiry</p>
                        <p className="text-xs text-amber-100">Create inquiry</p>
                    </div>
                </button>
                
                <button className="card-hover bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl p-4 shadow-lg flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div className="text-left">
                        <p className="font-semibold">Add Client</p>
                        <p className="text-xs text-emerald-100">Register client</p>
                    </div>
                </button>
                
                <button className="card-hover bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4 shadow-lg flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <div className="text-left">
                        <p className="font-semibold">Generate Report</p>
                        <p className="text-xs text-blue-100">View analytics</p>
                    </div>
                </button>
                
                <button className="card-hover bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-4 shadow-lg flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="text-left">
                        <p className="font-semibold">Schedule</p>
                        <p className="text-xs text-purple-100">View calendar</p>
                    </div>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card-hover bg-white rounded-xl p-6 shadow-lg border border-amber-100/50 cursor-pointer">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Total Clients</p>
                            <p className="text-3xl font-bold text-amber-600 mt-2">{stats.total_clients}</p>
                            <p className="text-xs text-emerald-600 mt-2">+12% from last month</p>
                        </div>
                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="card-hover bg-white rounded-xl p-6 shadow-lg border border-amber-100/50 cursor-pointer">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Total Inquiries</p>
                            <p className="text-3xl font-bold text-amber-600 mt-2">{stats.total_inquiries}</p>
                            <p className="text-xs text-emerald-600 mt-2">+8% from last month</p>
                        </div>
                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="card-hover bg-white rounded-xl p-6 shadow-lg border border-amber-100/50 cursor-pointer">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Pending Inquiries</p>
                            <p className="text-3xl font-bold text-amber-600 mt-2">{stats.pending_inquiries}</p>
                            <p className="text-xs text-red-600 mt-2">Requires attention</p>
                        </div>
                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="card-hover bg-white rounded-xl p-6 shadow-lg border border-amber-100/50 cursor-pointer">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Closed Today</p>
                            <p className="text-3xl font-bold text-amber-600 mt-2">{stats.closed_today || 5}</p>
                            <p className="text-xs text-emerald-600 mt-2">Great progress!</p>
                        </div>
                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-amber-100/50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                        <button className="text-amber-600 hover:text-amber-700 text-sm font-medium">View All</button>
                    </div>
                    <div className="space-y-4">
                        {recentInquiries.slice(0, 5).map((inquiry, index) => (
                            <div key={inquiry.inquiry_id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer">
                                <div className="flex-shrink-0">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        inquiry.status === 'closed' ? 'bg-emerald-100' :
                                        inquiry.status === 'in_progress' ? 'bg-amber-100' :
                                        'bg-gray-100'
                                    }`}>
                                        <svg className={`w-5 h-5 ${
                                            inquiry.status === 'closed' ? 'text-emerald-600' :
                                            inquiry.status === 'in_progress' ? 'text-amber-600' :
                                            'text-gray-600'
                                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{inquiry.subject}</p>
                                    <p className="text-xs text-gray-500">{inquiry.client?.client_name} - {new Date(inquiry.created_at).toLocaleDateString()}</p>
                                </div>
                                <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                                    inquiry.status === 'closed' ? 'bg-emerald-100 text-emerald-700' :
                                    inquiry.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                    {inquiry.status?.replace('_', ' ') || 'Unknown'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Priority Tasks */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-amber-100/50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Priority Tasks</h3>
                        <span className="bg-red-100 text-red-700 text-xs rounded-full px-2 py-1 font-semibold">3 Urgent</span>
                    </div>
                    <div className="space-y-3">
                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <p className="text-sm font-medium text-gray-900">Follow up with ABC Corp</p>
                            </div>
                            <p className="text-xs text-gray-600">Client inquiry pending response</p>
                        </div>
                        <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                <p className="text-sm font-medium text-gray-900">Update client records</p>
                            </div>
                            <p className="text-xs text-gray-600">5 clients need information update</p>
                        </div>
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <p className="text-sm font-medium text-gray-900">Weekly report due</p>
                            </div>
                            <p className="text-xs text-gray-600">Submit by Friday EOD</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-amber-100/50">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance</h3>
                <div className="grid grid-cols-7 gap-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                        <div key={day} className="text-center">
                            <p className="text-xs text-gray-600 mb-2">{day}</p>
                            <div className="relative h-24 bg-gray-100 rounded-lg">
                                <div 
                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-500 to-amber-400 rounded-lg"
                                    style={{ height: `${Math.random() * 80 + 20}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-800 mt-2 font-semibold">{Math.floor(Math.random() * 15 + 5)}</p>
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-center mt-4 space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-amber-500 rounded"></div>
                        <span className="text-gray-600">Inquiries Handled</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                        <span className="text-gray-600">Completed</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Inquiries Content Component
function InquiriesContent({ inquiries }) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Inquiries</h2>
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Inquiry Management</h3>
                <p className="text-gray-500">View and manage client inquiries</p>
                <div className="mt-6 space-y-2">
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow-md">
                        View All Inquiries
                    </button>
                </div>
            </div>
        </div>
    );
}

// Clients Content Component
function ClientsContent() {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Client Management</h2>
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Client Management</h3>
                <p className="text-gray-500">View and manage client information</p>
                <div className="mt-6 space-y-2">
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow-md">
                        View All Clients
                    </button>
                </div>
            </div>
        </div>
    );
}

// Profile Content Component
function ProfileContent({ authUser, userInfo, officeStaff }) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h2>
            <div className="space-y-6">
                {/* Personal Information */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <p className="text-gray-900">{userInfo?.firstname || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <p className="text-gray-900">{userInfo?.lastname || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <p className="text-gray-900">{authUser.username}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                            <p className="text-gray-900">{userInfo?.contact_number || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Office Information */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Office Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Extension Number</label>
                            <p className="text-gray-900">{officeStaff?.extension_no || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Shift</label>
                            <p className="text-gray-900 capitalize">{officeStaff?.assigned_shift || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Account Status */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
                    <div className="flex items-center space-x-4">
                        <span className={`inline-flex px-3 py-1 text-xs rounded-full font-medium ${
                            authUser.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {authUser.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="inline-flex px-3 py-1 text-xs rounded-full font-medium bg-green-100 text-green-800">
                            Office Staff
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
