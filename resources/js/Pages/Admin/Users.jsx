import React, { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import AddUserModal from '../../Components/AddUserModal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export default function Users({ userStats, authUser, trucks }) {
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showUserForm, setShowUserForm] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    
    const queryClient = useQueryClient();

    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); // Reset to page 1 on new search
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const fetchUsers = async ({ queryKey }) => {
        const [_key, page, search, role] = queryKey;
        const response = await axios.get(`/api/admin/users`, {
            params: {
                page: page,
                search: search,
                role: role
            }
        });
        return response.data;
    };

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['users', currentPage, debouncedSearch, filterRole],
        queryFn: fetchUsers,
        placeholderData: (previousData) => previousData,
    });

    useEffect(() => {
        if (data?.last_page && currentPage < data.last_page) {
            queryClient.prefetchQuery({
                queryKey: ['users', currentPage + 1, debouncedSearch, filterRole],
                queryFn: fetchUsers,
            });
        }
    }, [data, currentPage, debouncedSearch, filterRole, queryClient]);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        password_confirmation: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        phone: '',
        license_number: '',
        extension_no: '',
        is_active: true,
    });

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

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setShowRoleModal(false);
        setShowUserForm(true);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            password: '',
            password_confirmation: '',
            first_name: user.firstname || '',
            middle_name: user.middle_name || '',
            last_name: user.lastname || '',
            email: user.email || '',
            phone: user.contact_number || '',
            license_number: user.driver?.license_no || '',
            extension_no: user.extension_no || '',
            is_active: user.is_active,
        });
        setShowEditModal(true);
    };

    const handleDelete = (user) => {
        setUserToDelete(user);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            setShowDeleteConfirm(false);
            setUserToDelete(null);
            router.delete(`/admin/users/${userToDelete.user_id}`, {
                onSuccess: () => {
                    setSuccessMessage('User deleted successfully!');
                    setShowSuccessAnimation(true);
                    setTimeout(() => setShowSuccessAnimation(false), 3000);
                }
            });
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setUserToDelete(null);
    };

    const handleToggleStatus = (user) => {
        router.patch(`/admin/users/${user.user_id}/toggle-status`);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const submitData = { ...formData, role: selectedRole.value };
        router.post('/admin/users', submitData, {
            onSuccess: () => {
                setSuccessMessage(`${selectedRole.label} created successfully!`);
                setShowSuccessAnimation(true);
                setTimeout(() => setShowSuccessAnimation(false), 3000);
                setShowUserForm(false);
                setSelectedRole(null);
                setFormData({
                    username: '', password: '', password_confirmation: '',
                    first_name: '', middle_name: '', last_name: '', email: '', phone: '',
                    license_number: '',
                    extension_no: '', is_active: true,
                });
            },
            onError: (errors) => {
                console.log('Validation errors:', errors);
                alert('Error creating user: ' + Object.values(errors).flat().join('\n'));
            }
        });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        const submitData = { 
            ...formData, 
            role: editingUser.role,
            is_active: formData.is_active ? 1 : 0
        };
        router.put(`/admin/users/${editingUser.user_id}`, submitData, {
            onSuccess: () => {
                setShowEditModal(false);
                setEditingUser(null);
                setSuccessMessage('User updated successfully!');
                setShowSuccessAnimation(true);
                setTimeout(() => setShowSuccessAnimation(false), 3000);
            }
        });
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'office_staff': return 'bg-slate-100 text-slate-700 border border-slate-200';
            case 'operation_manager': return 'bg-blue-50 text-blue-700 border border-blue-200/50';
            case 'driver': return 'bg-emerald-50 text-emerald-700 border border-emerald-200/50';
            case 'mechanic': return 'bg-amber-50 text-amber-700 border border-amber-200/50';
            default: return 'bg-slate-50 text-slate-600 border border-slate-200';
        }
    };

    const getRoleLabel = (role) => {
        const roleInfo = roles.find(r => r.value === role);
        return roleInfo ? roleInfo.label : role;
    };

    return (
        <AdminLayout title="User Management" authUser={authUser} activeMenu="users" pendingDeliveries={0}>
            <div className="space-y-6">

                {/* Success Notification */}
                {showSuccessAnimation && (
                    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
                        <div className="bg-white border border-emerald-100 rounded-xl p-4 shadow-lg shadow-emerald-500/10 flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-gray-700">{successMessage}</p>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">User Registry</h1>
                    <p className="text-slate-500 mt-0.5 text-sm">Control administrative roles, field operators, and secure facial scan profiles</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                        { label: 'Total', value: userStats?.total || 0, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', bg: 'bg-slate-100', iconColor: 'text-slate-600' },
                        { label: 'Active', value: userStats?.active || 0, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
                        { label: 'Drivers', value: userStats?.drivers || 0, icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z', bg: 'bg-emerald-50/50', iconColor: 'text-emerald-500' },
                        { label: 'Mechanics', value: userStats?.mechanics || 0, icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z', bg: 'bg-amber-50', iconColor: 'text-amber-600' },
                        { label: 'Staff', value: userStats?.staff || 0, icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', bg: 'bg-slate-100/50', iconColor: 'text-slate-500' },
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center`}>
                                    <svg className={`w-4 h-4 ${stat.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">{stat.label}</p>
                                    <p className="text-lg font-semibold text-slate-900">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search accounts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-64 pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 hover:border-slate-300 focus:border-[#10B981] focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                            />
                            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Filter
                        </button>
                    </div>
                    <button
                        onClick={() => setShowRoleModal(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white text-sm font-medium rounded-lg shadow-md shadow-emerald-500/10 hover:shadow-lg transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add User</span>
                    </button>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50/80">
                                <tr>
                                    {['User', 'Role', 'Status', 'Contact Number', 'Created On', 'Actions'].map((header) => (
                                        <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-10 text-center">
                                            <div className="flex justify-center items-center gap-2 text-emerald-600">
                                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span className="text-sm font-medium">Loading users...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : data?.data?.length > 0 ? (
                                    data.data.map((user) => (
                                        <tr key={user.user_id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${user.role === 'admin' ? 'bg-slate-900 text-white font-bold' :
                                                            user.role === 'driver' ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-100' :
                                                                user.role === 'mechanic' ? 'bg-amber-50 text-amber-700 font-bold border border-amber-100' :
                                                                    'bg-slate-100 text-slate-700 font-bold border border-slate-200'
                                                        }`}>
                                                        <span className="text-xs">{user.firstname?.charAt(0) || user.username.charAt(0)}</span>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-slate-900">{user.firstname} {user.lastname}</div>
                                                        </div>
                                                    </div>
    
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${getRoleBadge(user.role)}`}>
                                                    {getRoleLabel(user.role)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${user.is_active
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/30 hover:bg-emerald-100'
                                                            : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                                                        }`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-slate-500">
                                                {user.contact_number || '—'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-slate-400">
                                                {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="p-1.5 text-slate-400 hover:text-[#10B981] hover:bg-emerald-50 rounded-md transition-colors"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-10 text-center">
                                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-sm font-medium text-slate-900 mb-1">No users found</h3>
                                            <p className="text-xs text-slate-500">Try adjusting your search filters</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {data?.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-between bg-white px-4 py-3 border border-slate-200/60 rounded-xl shadow-sm">
                        <div className="flex flex-1 justify-between sm:hidden">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(data.last_page, p + 1))}
                                disabled={currentPage === data.last_page}
                                className="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-slate-700">
                                    Showing <span className="font-medium">{((currentPage - 1) * 10) + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(currentPage * 10, data.total)}</span> of{' '}
                                    <span className="font-medium">{data.total}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
                                    >
                                        <span className="sr-only">Previous</span>
                                        <svg className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm pr-2">Previous</span>
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(data.last_page, p + 1))}
                                        disabled={currentPage === data.last_page}
                                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
                                    >
                                        <span className="text-sm pl-2">Next</span>
                                        <svg className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Role Selection Modal */}
            {showRoleModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 py-6">
                        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowRoleModal(false)}></div>
                        <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-100">
                            <div className="relative px-8 py-6 border-b border-slate-100">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-700" />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">Select User Role</h3>
                                        <p className="text-xs text-slate-500 mt-1">Determine user system capabilities and duty flows</p>
                                    </div>
                                    <button onClick={() => setShowRoleModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {roles.map((role) => (
                                        <button
                                            key={role.value}
                                            onClick={() => handleRoleSelect(role)}
                                            className="group relative p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 text-left overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 via-emerald-50/0 to-emerald-50/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="relative flex items-start gap-4">
                                                <div className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${role.color} rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10 group-hover:scale-105 transition-transform duration-300`}>
                                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={role.icon} />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-base font-bold text-slate-900 mb-1 group-hover:text-[#10B981] transition-colors">{role.label}</h4>
                                                    <p className="text-xs text-slate-500 leading-relaxed">{role.description}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* User Form Modal Extracted Component */}
            <AddUserModal
                show={showUserForm}
                onClose={() => {
                    setShowUserForm(false);
                    setSelectedRole(null);
                }}
                selectedRole={selectedRole}
                onSuccess={() => {
                    setSuccessMessage(`${selectedRole.label} created successfully!`);
                    setShowSuccessAnimation(true);
                    setTimeout(() => setShowSuccessAnimation(false), 3000);
                    setShowUserForm(false);
                    setSelectedRole(null);
                }}
            />

            {/* Edit Modal */}
            {showEditModal && editingUser && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 py-6">
                        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
                        <div className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden border border-slate-100">
                            <div className="relative flex items-center justify-between px-8 py-6 border-b border-slate-100">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10 text-white font-bold text-sm">
                                        {editingUser.firstname?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">Edit {getRoleLabel(editingUser.role)}</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">Update user information</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowEditModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-6 p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
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

                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Account Details</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Username <span className="text-red-500">*</span></label>
                                            <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-emerald-300 focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" required />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                                            <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-emerald-300 focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" required />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Change Password (Optional)</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">New Password</label>
                                            <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-emerald-300 focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Confirm New Password</label>
                                            <input type="password" value={formData.password_confirmation} onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-emerald-300 focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center pt-2">
                                    <input type="checkbox" id="is_active_edit" checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-5 h-5 text-[#10B981] border-slate-300 rounded-lg focus:ring-emerald-500 focus:ring-2 cursor-pointer" />
                                    <label htmlFor="is_active_edit" className="ml-3 text-xs font-semibold text-slate-700 cursor-pointer select-none">Active User Account</label>
                                </div>

                                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                                    <button type="button" onClick={() => setShowEditModal(false)}
                                        className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all">
                                        Cancel
                                    </button>
                                    <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] rounded-lg shadow-md shadow-emerald-500/10 transition-all">
                                        Update User
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && userToDelete && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 py-6">
                        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={cancelDelete}></div>
                        <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
                            <div className="relative px-8 py-6 border-b border-slate-100">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-red-500 to-rose-600" />
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/5">
                                        <svg className="w-7 h-7 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900">Delete User</h3>
                                        <p className="text-xs text-slate-500 font-medium">This action cannot be undone</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="mb-6 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-sm">
                                            {userToDelete.firstname?.charAt(0) || userToDelete.username.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-950">{userToDelete.firstname} {userToDelete.lastname}</p>
                                            <p className="text-[10px] text-slate-400">@{userToDelete.username}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button onClick={cancelDelete} className="flex-1 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all">
                                        Cancel
                                    </button>
                                    <button onClick={confirmDelete} className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-all shadow-md shadow-rose-500/10">
                                        Delete User
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
