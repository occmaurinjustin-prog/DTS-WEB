import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export default function Drivers({ authUser, stats }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
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

    // Fetch Drivers function
    const fetchDrivers = async ({ queryKey }) => {
        const [_key, page, search, status] = queryKey;
        const response = await axios.get(`/api/admin/drivers`, {
            params: {
                page: page,
                search: search,
                status: status
            }
        });
        return response.data;
    };

    const { data, isLoading, isFetching, isPlaceholderData } = useQuery({
        queryKey: ['drivers', currentPage, debouncedSearch, filterStatus],
        queryFn: fetchDrivers,
        placeholderData: (previousData) => previousData,
    });

    // Prefetch next page
    useEffect(() => {
        if (data?.meta && data.meta.current_page < data.meta.last_page) {
            queryClient.prefetchQuery({
                queryKey: ['drivers', currentPage + 1, debouncedSearch, filterStatus],
                queryFn: fetchDrivers,
            });
        }
    }, [data, currentPage, debouncedSearch, filterStatus, queryClient]);

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ 
                only: ['stats'],
                preserveScroll: true,
                preserveState: true,
            });
            queryClient.invalidateQueries({ queryKey: ['drivers'] });
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status) => {
        switch(status) {
            case 'available': return 'bg-emerald-50 text-emerald-700 border border-emerald-200/50';
            case 'on_duty': return 'bg-amber-50 text-amber-700 border border-amber-200/50';
            case 'off_duty': return 'bg-slate-100 text-slate-600 border border-slate-200';
            case 'on_leave': return 'bg-blue-50 text-blue-700 border border-blue-200/50';
            case 'in_transit': return 'bg-orange-50 text-orange-700 border border-orange-200/50';
            case 'busy': return 'bg-rose-50 text-rose-700 border border-rose-200/50';
            default: return 'bg-slate-50 text-slate-600 border border-slate-200';
        }
    };

    const driversList = data?.drivers || [];
    const queryStats = data?.stats || stats;

    return (
        <AdminLayout title="Driver Management" authUser={authUser} activeMenu="drivers" pendingDeliveries={queryStats?.pending_deliveries || 0}>
            <div className="space-y-6">

                {/* Header Title */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Drivers Roster</h1>
                    <p className="text-slate-500 mt-0.5 text-sm">Monitor operator active states, license registries, and real-time duty status</p>
                </div>

                {/* Toolbar - Compact Premium */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <input 
                                type="text" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search drivers..."
                                className="w-64 pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 hover:border-slate-300 focus:border-[#10B981] focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                            />
                            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        >
                            <option value="all">All Status</option>
                            <option value="available">Available</option>
                            <option value="busy">Busy</option>
                            <option value="in_transit">In Transit</option>
                            <option value="off_duty">Off Duty</option>
                            <option value="on_duty">On Duty</option>
                            <option value="on_leave">On Leave</option>
                        </select>
                    </div>
                </div>

                {/* Drivers Table - Compact Premium */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden relative">
                    {(isFetching && isPlaceholderData) && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981]"></div>
                        </div>
                    )}
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50/80">
                                <tr>
                                    {['Driver', 'License No.', 'Duty Status', 'Contact Number', 'Actions'].map((header) => (
                                        <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {driversList.length > 0 ? (
                                    driversList.map((driver) => (
                                        <tr key={driver.driver_id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {driver.user?.profile_image ? (
                                                        <img src={driver.user.profile_image.startsWith('http') || driver.user.profile_image.startsWith('/') ? driver.user.profile_image : `/storage/${driver.user.profile_image}`} alt="Profile" className="w-8 h-8 rounded-lg object-cover shadow-sm border border-slate-200" />
                                                    ) : (
                                                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-sm">
                                                            <span className="text-white font-bold text-xs">{driver.user?.firstname?.charAt(0) || 'D'}</span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-semibold text-slate-900">{driver.user?.firstname} {driver.user?.lastname}</div>
                                                        <div className="text-[10px] text-slate-400">ID: {String(driver.driver_id).padStart(4, '0')}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-slate-600">
                                                {driver.license_no}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${getStatusColor(driver.availability_status)}`}>
                                                    {driver.availability_status?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-slate-500">
                                                {driver.user?.contact_number || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <button className="p-1 text-slate-400 hover:text-[#10B981] hover:bg-emerald-50 rounded-md transition-colors" title="Send Message">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-12 text-center text-sm text-slate-500">
                                            No drivers found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        
                        {/* Pagination UI */}
                        {data?.meta && (
                            <div className="p-4 border-t border-slate-200 flex items-center justify-between">
                                <button
                                    onClick={() => setCurrentPage(old => Math.max(old - 1, 1))}
                                    disabled={currentPage === 1 || isPlaceholderData}
                                    className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    &lt; Previous
                                </button>
                                <span className="text-sm text-slate-700">
                                    Page {data.meta.current_page} of {data.meta.last_page || 1}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(old => (data.meta.current_page < data.meta.last_page ? old + 1 : old))}
                                    disabled={currentPage === data.meta.last_page || !data.meta.last_page || isPlaceholderData}
                                    className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next &gt;
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
