import React, { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Users({ users, authUser, trucks }) {
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
    const [isCameraActive, setIsCameraActive] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
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
        assigned_shift: '',
        is_active: true,
        face_descriptor: null,
    });

    const roles = [
        {
            value: 'office_staff',
            label: 'Office Staff',
            icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
            color: 'from-emerald-500 to-teal-500',
            description: 'Handle administrative tasks'
        },
        {
            value: 'operation_manager',
            label: 'Operation Manager',
            icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
            color: 'from-red-500 to-red-600',
            description: 'Manage operations and deliveries'
        },
        {
            value: 'driver',
            label: 'Driver',
            icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
            color: 'from-blue-500 to-indigo-500',
            description: 'Handle deliveries and transport'
        },
        {
            value: 'mechanic',
            label: 'Mechanic',
            icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
            color: 'from-amber-500 to-orange-500',
            description: 'Maintain and repair vehicles'
        },
    ];

    // Camera functions for face capture
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 640, height: 480 }
            });
            streamRef.current = stream;
            setIsCameraActive(true);

            // Small delay to let React render the video element
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play().catch(err => {
                        console.error('Video play error:', err);
                    });
                    console.log('Video element found, setting stream');
                } else {
                    console.error('Video ref not found');
                }
            }, 100);
        } catch (err) {
            console.error('Camera access error:', err);
            alert('Cannot access camera. Please allow camera permissions.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraActive(false);
    };

    const captureFace = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Generate mock face descriptor from image data
        // In production, you would use face-api.js to extract real face descriptors
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const mockFaceDescriptor = generateMockDescriptorFromImage(imageData);

        setFormData({...formData, face_descriptor: mockFaceDescriptor});
        stopCamera();
    };

    const generateMockDescriptorFromImage = (imageData) => {
        // Create a deterministic but unique descriptor based on image pixels
        const descriptor = [];
        const step = Math.floor(imageData.data.length / 128);
        for (let i = 0; i < 128; i++) {
            const pixelIndex = i * step * 4;
            const r = imageData.data[pixelIndex] || 0;
            const g = imageData.data[pixelIndex + 1] || 0;
            const b = imageData.data[pixelIndex + 2] || 0;
            // Normalize to 0-1 range
            const value = ((r + g + b) / 3) / 255;
            descriptor.push(value);
        }
        return descriptor;
    };

    useEffect(() => {
        return () => {
            // Cleanup camera on unmount
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

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
            email: '',
            phone: user.contact_number || '',
            license_number: user.driver?.license_no || '',
            extension_no: user.extension_no || '',
            assigned_shift: user.assigned_shift || '',
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
                    extension_no: '', assigned_shift: '', is_active: true,
                    face_descriptor: null,
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
        const submitData = { ...formData, role: editingUser.role };
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
        const roleInfo = roles.find(r => r.value === role);
        if (!roleInfo) return 'bg-gray-100 text-gray-800';
        switch(role) {
            case 'office_staff': return 'bg-emerald-100 text-emerald-700';
            case 'operation_manager': return 'bg-amber-100 text-amber-700';
            case 'driver': return 'bg-blue-100 text-blue-700';
            case 'mechanic': return 'bg-orange-100 text-orange-700';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleLabel = (role) => {
        const roleInfo = roles.find(r => r.value === role);
        return roleInfo ? roleInfo.label : role;
    };

    return (
        <AdminLayout title="User Management" authUser={authUser} activeMenu="users" pendingDeliveries={0}>
            <div className="space-y-6">
                {/* Success Message */}
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

                {/* Stats - Compact */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    {[
                        { label: 'Total', value: users.length, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', bg: 'bg-slate-100', iconColor: 'text-slate-600' },
                        { label: 'Active', value: users.filter(u => u.is_active).length, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
                        { label: 'Drivers', value: users.filter(u => u.role === 'driver').length, icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z', bg: 'bg-blue-50', iconColor: 'text-blue-600' },
                        { label: 'Mechanics', value: users.filter(u => u.role === 'mechanic').length, icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z', bg: 'bg-orange-50', iconColor: 'text-orange-600' },
                        { label: 'Staff', value: users.filter(u => u.role === 'office_staff').length, icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', bg: 'bg-indigo-50', iconColor: 'text-[#4F46E5]' },
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

                {/* Toolbar - Compact */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-64 pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 hover:border-slate-300 focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                            />
                            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Filter
                        </button>
                    </div>
                    <button 
                        onClick={() => setShowRoleModal(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-medium rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add User
                    </button>
                </div>

                {/* Users Table - Compact */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50/80">
                                <tr>
                                    {['User', 'Role', 'Status', 'Contact', 'Created', 'Actions'].map((header) => (
                                        <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.length > 0 ? (
                                    users.filter(user => {
                                        const searchLower = searchTerm.toLowerCase();
                                        return (
                                            user.username.toLowerCase().includes(searchLower) ||
                                            user.firstname.toLowerCase().includes(searchLower) ||
                                            user.lastname.toLowerCase().includes(searchLower) ||
                                            user.role.toLowerCase().includes(searchLower)
                                        );
                                    }).map((user) => (
                                        <tr key={user.user_id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                                        user.role === 'admin' ? 'bg-[#4F46E5] text-white' :
                                                        user.role === 'driver' ? 'bg-blue-100 text-blue-600' :
                                                        user.role === 'mechanic' ? 'bg-orange-100 text-orange-600' :
                                                        user.role === 'office_staff' ? 'bg-emerald-100 text-emerald-600' :
                                                        'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        <span className="text-xs font-semibold">{user.firstname?.charAt(0) || user.username.charAt(0)}</span>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-slate-900">{user.firstname} {user.lastname}</div>
                                                        <div className="text-xs text-slate-500">@{user.username}</div>
                                                        {user.role === 'mechanic' && user.unique_id && (
                                                            <div className="text-xs font-mono text-orange-600 bg-orange-50 px-2 py-0.5 rounded mt-1 inline-block">
                                                                ID: {user.unique_id}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-md ${getRoleBadge(user.role)}`}>
                                                    {getRoleLabel(user.role)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md transition-colors ${
                                                        user.is_active 
                                                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                                                {user.contact_number || '—'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                                                {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="p-1.5 text-slate-500 hover:text-[#4F46E5] hover:bg-indigo-50 rounded-md transition-all"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user)}
                                                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
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
                                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                <svg className="w-6 h-6 text-[#4F46E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-sm font-medium text-slate-900 mb-1">No users found</h3>
                                            <p className="text-xs text-slate-500">Try adjusting your search or add a new user.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                            Showing {users.filter(user => {
                                const searchLower = searchTerm.toLowerCase();
                                return (
                                    user.username.toLowerCase().includes(searchLower) ||
                                    user.firstname.toLowerCase().includes(searchLower) ||
                                    user.lastname.toLowerCase().includes(searchLower) ||
                                    user.role.toLowerCase().includes(searchLower)
                                );
                            }).length} of {users.length} users
                        </span>
                        <div className="flex items-center gap-1">
                            <button className="px-3 py-1.5 text-xs font-medium text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50" disabled>
                                Prev
                            </button>
                            <button className="px-3 py-1.5 text-xs font-medium text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50" disabled>
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Role Selection Modal - Premium Styled */}
            {showRoleModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 py-6">
                        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setShowRoleModal(false)}></div>
                        <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden">
                            {/* Header with gradient accent */}
                            <div className="relative px-8 py-6 border-b border-slate-100">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Select User Role</h3>
                                        <p className="text-sm text-slate-500 mt-1.5 font-medium">Choose the appropriate role for the new user</p>
                                    </div>
                                    <button onClick={() => setShowRoleModal(false)} className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
                                            className="group relative p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 text-left overflow-hidden"
                                        >
                                            {/* Hover gradient overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 via-indigo-50/0 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                            <div className="relative flex items-start gap-4">
                                                <div className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${role.color} rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300`}>
                                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d={role.icon} />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-lg font-bold text-slate-900 mb-1.5 group-hover:text-indigo-600 transition-colors">{role.label}</h4>
                                                    <p className="text-sm text-slate-500 leading-relaxed">{role.description}</p>
                                                </div>
                                                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                    </svg>
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

            {/* User Form Modal - Premium Styled */}
            {showUserForm && selectedRole && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 py-6">
                        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setShowUserForm(false)}></div>
                        <div className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden">
                            {/* Header with gradient accent */}
                            <div className="relative flex items-center justify-between px-8 py-6 border-b border-slate-100">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 bg-gradient-to-br ${selectedRole.color} rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20`}>
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d={selectedRole.icon} />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Add {selectedRole.label}</h3>
                                        <p className="text-sm text-slate-500 mt-0.5 font-medium">Create a new user account</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowUserForm(false)} className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
                                {/* Name Section */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Full Name</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">First Name <span className="text-red-500">*</span></label>
                                            <input type="text" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 outline-none" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Middle Name</label>
                                            <input type="text" value={formData.middle_name} onChange={(e) => setFormData({...formData, middle_name: e.target.value})}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name <span className="text-red-500">*</span></label>
                                            <input type="text" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 outline-none" required />
                                        </div>
                                    </div>
                                </div>

                                {/* Account Section */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Account Details</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedRole.value !== 'mechanic' && (
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Username <span className="text-red-500">*</span></label>
                                                <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 outline-none" required />
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                                            <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 outline-none" required />
                                        </div>
                                    </div>
                                </div>

                                {selectedRole.value !== 'mechanic' && (
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Security</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Password <span className="text-red-500">*</span></label>
                                                <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 outline-none" required />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password <span className="text-red-500">*</span></label>
                                                <input type="password" value={formData.password_confirmation} onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 outline-none" required />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {selectedRole.value === 'office_staff' && (
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Work Details</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Extension</label>
                                                <input type="text" value={formData.extension_no} onChange={(e) => setFormData({...formData, extension_no: e.target.value})}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 outline-none" placeholder="e.g. 101" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Shift</label>
                                                <select value={formData.assigned_shift} onChange={(e) => setFormData({...formData, assigned_shift: e.target.value})}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 outline-none appearance-none">
                                                    <option value="">Select Shift</option>
                                                    <option value="morning">Morning (6AM - 2PM)</option>
                                                    <option value="afternoon">Afternoon (2PM - 10PM)</option>
                                                    <option value="night">Night (10PM - 6AM)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedRole.value === 'driver' && (
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Driver Information</h4>
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                                    </svg>
                                                </div>
                                                <h4 className="text-lg font-bold text-slate-800">License Details</h4>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">License Number <span className="text-red-500">*</span></label>
                                                <input type="text" value={formData.license_number} onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 outline-none" placeholder="DL123456" required />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedRole.value === 'mechanic' && (
                                    <div className="space-y-6">
                                        {/* Email Field for Mechanics */}
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email Address <span className="text-red-500">*</span></label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 hover:border-gray-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200 outline-none"
                                                placeholder="mechanic@company.com"
                                                required
                                            />
                                        </div>

                                        {/* Unique ID Info */}
                                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3 3 0 01-3-3V6" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">Unique ID (Auto-generated)</p>
                                                    <p className="text-xs text-gray-500">Will be assigned as MEC-YYYY-XXXX format</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Face Recognition Section */}
                                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100">
                                            <div className="flex items-center mb-4">
                                                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center mr-3">
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </div>
                                                <h4 className="text-lg font-bold text-gray-800">Face Recognition</h4>
                                            </div>

                                            <div className="space-y-4">
                                                {/* Face Capture Preview */}
                                                {/* Hidden canvas for capturing */}
                                                <canvas ref={canvasRef} className="hidden" />

                                                <div className="relative bg-gray-900 rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                                                    {formData.face_descriptor ? (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="text-center">
                                                                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                </div>
                                                                <p className="text-white text-sm font-medium">Face Captured Successfully</p>
                                                            </div>
                                                        </div>
                                                    ) : isCameraActive ? (
                                                        <div className="absolute inset-0">
                                                            <video
                                                                ref={videoRef}
                                                                autoPlay
                                                                playsInline
                                                                muted
                                                                className="w-full h-full object-cover"
                                                                style={{ transform: 'scaleX(-1)' }}
                                                            />
                                                            {/* Face Frame Overlay */}
                                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                                <div className="w-32 h-40 border-2 border-orange-400 rounded-lg relative">
                                                                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-orange-500"></div>
                                                                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-orange-500"></div>
                                                                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-orange-500"></div>
                                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-orange-500"></div>
                                                                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-orange-500"
                                                                        style={{ animation: 'scan 2s linear infinite' }}></div>
                                                                </div>
                                                            </div>
                                                            <div className="absolute bottom-3 left-0 right-0 text-center">
                                                                <p className="text-white text-xs bg-black/50 inline-block px-3 py-1 rounded-full">
                                                                    Position your face in the frame
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="text-center">
                                                                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                                                                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                    </svg>
                                                                </div>
                                                                <p className="text-gray-400 text-sm">Camera ready to start</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Camera Controls */}
                                                {isCameraActive ? (
                                                    <div className="flex gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={captureFace}
                                                            className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-medium text-sm hover:bg-red-600 shadow-lg shadow-red-500/25 transition-all"
                                                        >
                                                            <span className="flex items-center justify-center gap-2">
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                                Take Photo
                                                            </span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={stopCamera}
                                                            className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-300 transition-all"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : formData.face_descriptor ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({...formData, face_descriptor: null})}
                                                        className="w-full py-3 px-4 bg-gray-100 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
                                                    >
                                                        <span className="flex items-center justify-center gap-2">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                            </svg>
                                                            Retake Face Capture
                                                        </span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={startCamera}
                                                        className="w-full py-3 px-4 bg-orange-500 text-white rounded-xl font-medium text-sm hover:bg-orange-600 shadow-lg shadow-orange-500/25 transition-all"
                                                    >
                                                        <span className="flex items-center justify-center gap-2">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            Start Camera
                                                        </span>
                                                    </button>
                                                )}

                                                <p className="text-xs text-gray-500 text-center">
                                                    Face data is required for mechanic login. Click "Capture Face" to register face recognition.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center pt-2">
                                    <input type="checkbox" id="is_active" checked={formData.is_active}
                                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                        className="w-5 h-5 text-indigo-600 border-slate-300 rounded-lg focus:ring-indigo-500 focus:ring-2 cursor-pointer" />
                                    <label htmlFor="is_active" className="ml-3 text-sm font-semibold text-slate-700 cursor-pointer select-none">Active User Account</label>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                    <button type="button" onClick={() => {setShowUserForm(false); setSelectedRole(null);}}
                                        className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all duration-200">
                                        Cancel
                                    </button>
                                    <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all duration-200">
                                        Create {selectedRole.label}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal - Premium Styled */}
            {showEditModal && editingUser && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 py-6">
                        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setShowEditModal(false)}></div>
                        <div className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden">
                            {/* Header with gradient accent */}
                            <div className="relative flex items-center justify-between px-8 py-6 border-b border-slate-100">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 bg-gradient-to-br ${getRoleBadge(editingUser.role).replace('bg-', 'from-').replace('text-', 'to-').replace('100', '500').replace('700', '600')} rounded-2xl flex items-center justify-center shadow-lg`}>
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Edit {getRoleLabel(editingUser.role)}</h3>
                                        <p className="text-sm text-slate-500 mt-0.5 font-medium">Update user information</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowEditModal(false)} className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-6 p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
                                {/* Name Section */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Full Name</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">First Name <span className="text-red-500">*</span></label>
                                            <input type="text" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-amber-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-200 outline-none" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Middle Name</label>
                                            <input type="text" value={formData.middle_name} onChange={(e) => setFormData({...formData, middle_name: e.target.value})}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-amber-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-200 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name <span className="text-red-500">*</span></label>
                                            <input type="text" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-amber-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-200 outline-none" required />
                                        </div>
                                    </div>
                                </div>

                                {/* Account Section */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Account Details</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Username <span className="text-red-500">*</span></label>
                                            <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-amber-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-200 outline-none" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                                            <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-amber-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-200 outline-none" required />
                                        </div>
                                    </div>
                                </div>

                                {/* Security Section */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Change Password (Optional)</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                                            <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-amber-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-200 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
                                            <input type="password" value={formData.password_confirmation} onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-amber-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-200 outline-none" />
                                        </div>
                                    </div>
                                </div>
                                
                                {editingUser.role === 'office_staff' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Extension</label>
                                            <input type="text" value={formData.extension_no} onChange={(e) => setFormData({...formData, extension_no: e.target.value})} 
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
                                            <select value={formData.assigned_shift} onChange={(e) => setFormData({...formData, assigned_shift: e.target.value})} 
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                                                <option value="">Select Shift</option>
                                                <option value="morning">Morning</option>
                                                <option value="afternoon">Afternoon</option>
                                                <option value="night">Night</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                                
                                {editingUser.role === 'driver' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">License No.</label>
                                            <input type="text" value={formData.license_number} onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Plate No.</label>
                                            <input type="text" value={formData.plate} onChange={(e) => setFormData({...formData, plate: e.target.value})}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                                            <input type="text" value={formData.vehicle} onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                                            <input type="text" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                                            <select value={formData.condition} onChange={(e) => setFormData({...formData, condition: e.target.value})}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                                                <option value="">Select Condition</option>
                                                <option value="excellent">Excellent</option>
                                                <option value="good">Good</option>
                                                <option value="fair">Fair</option>
                                                <option value="poor">Poor</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {editingUser.role === 'mechanic' && (
                                    <div className="space-y-4">
                                        {/* Face Recognition Section */}
                                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100">
                                            <div className="flex items-center mb-4">
                                                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center mr-3">
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </div>
                                                <h4 className="text-lg font-bold text-gray-800">Face Recognition</h4>
                                            </div>

                                            <div className="space-y-4">
                                                {formData.face_descriptor || editingUser.face_descriptor ? (
                                                    <div className="text-center py-4">
                                                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                        <p className="text-green-700 font-medium">Face Data Registered</p>
                                                        <p className="text-sm text-gray-500 mt-1">Mechanic can login using face recognition</p>
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({...formData, face_descriptor: null})}
                                                            className="mt-3 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
                                                        >
                                                            Reset Face Data
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4">
                                                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                        </div>
                                                        <p className="text-gray-600 font-medium">No Face Data</p>
                                                        <p className="text-sm text-gray-500 mt-1 mb-3">Capture face to enable face login</p>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const mockFaceDescriptor = Array(128).fill(0).map(() => Math.random());
                                                                setFormData({...formData, face_descriptor: mockFaceDescriptor});
                                                            }}
                                                            className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
                                                        >
                                                            Capture Face
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Unique ID Display */}
                                        {editingUser.unique_id && (
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Unique ID</label>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono text-gray-900">
                                                        {editingUser.unique_id}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center pt-2">
                                    <input type="checkbox" id="is_active_edit" checked={formData.is_active}
                                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                        className="w-5 h-5 text-amber-600 border-slate-300 rounded-lg focus:ring-amber-500 focus:ring-2 cursor-pointer" />
                                    <label htmlFor="is_active_edit" className="ml-3 text-sm font-semibold text-slate-700 cursor-pointer select-none">Active User Account</label>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                    <button type="button" onClick={() => setShowEditModal(false)}
                                        className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all duration-200">
                                        Cancel
                                    </button>
                                    <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all duration-200">
                                        Update User
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal - Premium Styled */}
            {showDeleteConfirm && userToDelete && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 py-6">
                        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={cancelDelete}></div>
                        <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
                            {/* Header with gradient accent */}
                            <div className="relative px-8 py-6 border-b border-slate-100">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-red-500 to-pink-500" />
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/25">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Delete User</h3>
                                        <p className="text-sm text-slate-500 mt-0.5 font-medium">This action cannot be undone</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="mb-6 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-500 rounded-xl flex items-center justify-center text-lg font-bold text-white">
                                            {userToDelete.firstname?.charAt(0) || userToDelete.username.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-base font-semibold text-slate-900">{userToDelete.firstname} {userToDelete.lastname}</p>
                                            <p className="text-sm text-slate-500">@{userToDelete.username}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={cancelDelete} className="flex-1 px-5 py-3 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all duration-200">
                                        Cancel
                                    </button>
                                    <button onClick={confirmDelete} className="flex-1 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-red-600 rounded-xl shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:scale-[1.02] transition-all duration-200">
                                        Delete User
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* CSS for scanning animation */}
            <style>{`
                @keyframes scan {
                    0% { top: 0; }
                    50% { top: 100%; }
                    100% { top: 0; }
                }
            `}</style>
        </AdminLayout>
    );
}
