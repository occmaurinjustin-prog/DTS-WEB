import React, { useState, useEffect } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import { router } from '@inertiajs/react';

// Icon components
const ChartBarIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const DocumentTextIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const TruckIcon = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
    </svg>
);

const WrenchIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const UserGroupIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const CalendarIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const DownloadIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
    </svg>
);

const FilterIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
);

export default function Reports({ authUser, deliveryStats, driverStats, truckStats, maintenanceStats, userStats, deliveryData, maintenanceData, url }) {
    // Get initial date range from URL parameters
    const getInitialDateRange = () => {
        try {
            const currentUrl = url || window.location.href;
            const urlParams = new URLSearchParams(currentUrl.split('?')[1] || '');
            return urlParams.get('dateRange') || 'today';
        } catch (error) {
            console.error('Error parsing URL:', error);
            return 'today';
        }
    };

    const [activeTab, setActiveTab] = useState('deliveries');
    const [dateRange, setDateRange] = useState(getInitialDateRange());
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState({
        delivery: deliveryStats,
        driver: driverStats,
        truck: truckStats,
        maintenance: maintenanceStats,
        user: userStats
    });

    const [deliveryDataState, setDeliveryDataState] = useState(deliveryData || []);
    const [maintenanceDataState, setMaintenanceDataState] = useState(maintenanceData || []);
    const [showExportModal, setShowExportModal] = useState(false);

    // Function to fetch filtered data based on date range
    const fetchFilteredData = async (range) => {
        setIsLoading(true);
        try {
            const response = await router.get('/admin/reports', {
                dateRange: range,
                preserveState: false, // Reset state to prevent conflicts
                preserveScroll: true,
                only: ['deliveryStats', 'driverStats', 'truckStats', 'maintenanceStats', 'userStats', 'deliveryData', 'maintenanceData'],
                onSuccess: (page) => {
                    setStats({
                        delivery: page.props.deliveryStats,
                        driver: page.props.driverStats,
                        truck: page.props.truckStats,
                        maintenance: page.props.maintenanceStats,
                        user: page.props.userStats
                    });
                    setDeliveryDataState(page.props.deliveryData || []);
                    setMaintenanceDataState(page.props.maintenanceData || []);
                    // Update the date range state to match the URL
                    setDateRange(range);
                }
            });
        } catch (error) {
            console.error('Error fetching filtered data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle date range change
    const handleDateRangeChange = (range) => {
        setDateRange(range);
        fetchFilteredData(range);
    };

    // Export functionality
    const handleExport = () => {
        const data = activeTab === 'deliveries' ? deliveryDataState : 
                    activeTab === 'maintenance' ? maintenanceDataState : 
                    [];
        
        // For drivers tab, always allow export since we export stats data
        const hasData = activeTab === 'drivers' ? true : (data && data.length > 0);
        
        if (!hasData) {
            return; // Silently return if no data available
        }

        // Show custom confirmation modal
        setShowExportModal(true);
    };

    // Function to perform the actual export
    const performExport = () => {
        const data = activeTab === 'deliveries' ? deliveryDataState : 
                    activeTab === 'maintenance' ? maintenanceDataState : 
                    [];
        
        let csvContent = '';
        let filename = '';

        if (activeTab === 'deliveries') {
            csvContent = 'Tracking Number,Customer,Status,Pickup Address,Destination Address,Created At\n';
            csvContent += data.map(delivery => 
                `"${delivery.tracking_number || `DEL-${delivery.id}`}","${delivery.customer || ''}","${delivery.status || ''}","${delivery.pickup_address || ''}","${delivery.destination_address || ''}","${delivery.created_at || ''}"`
            ).join('\n');
            filename = `delivery_report_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
        } else if (activeTab === 'maintenance') {
            csvContent = 'Report ID,Vehicle Type,Issue Type,Parts Used,Status,Report Date\n';
            csvContent += data.map(maintenance => 
                `"${maintenance.report_id || ''}","${maintenance.vehicle_type || ''}","${maintenance.issue_title || ''}","${maintenance.parts_used || ''}","${maintenance.status || ''}","${maintenance.report_date || ''}"`
            ).join('\n');
            filename = `maintenance_report_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
        } else if (activeTab === 'drivers') {
            // For drivers, we'll export the stats data since we don't have detailed driver data
            csvContent = 'Metric,Value\n';
            csvContent += `"Total Drivers","${driverStats.total || 0}"\n`;
            csvContent += `"Active Drivers","${driverStats.active || 0}"\n`;
            csvContent += `"Average Rating","${driverStats.averageRating || 0}"\n`;
            csvContent += `"Total Distance","${driverStats.totalDistance || 0}"\n`;
            filename = `driver_report_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
        }

            // Create and download the CSV file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Close modal after export
            setShowExportModal(false);
    };

    const tabs = [
        { id: 'deliveries', name: 'Deliveries', icon: TruckIcon },
        { id: 'maintenance', name: 'Maintenance', icon: WrenchIcon },
        { id: 'drivers', name: 'Drivers', icon: UserGroupIcon }
    ];

    const dateRanges = [
        { id: 'today', name: 'Today' },
        { id: 'week', name: 'This Week' },
        { id: 'month', name: 'This Month' },
        { id: 'year', name: 'This Year' },
        { id: 'custom', name: 'Custom Range' }
    ];

    const renderDeliveryReports = () => (
        <div className="space-y-6">
            {/* Delivery Details Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Delivery Details</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {deliveryDataState && deliveryDataState.length > 0 ? (
                                deliveryDataState.map((delivery) => (
                                    <tr key={delivery.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {delivery.tracking_number || `DEL-${delivery.id}`}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {delivery.customer}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                delivery.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                delivery.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                                                delivery.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                                                delivery.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {delivery.status === 'delivered' ? 'Delivered' :
                                                 delivery.status === 'in_transit' ? 'In Transit' :
                                                 delivery.status === 'assigned' ? 'Assigned' :
                                                 delivery.status === 'pending' ? 'Pending' :
                                                 delivery.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                                            {delivery.pickup_address || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                                            {delivery.destination_address || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {delivery.created_at}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <button className="text-blue-600 hover:text-blue-900">View Details</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        No delivery data available for the selected period
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderMaintenanceReports = () => (
        <div className="space-y-6">
            {/* Maintenance Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Requests</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.maintenance.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <WrenchIcon className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Completed</p>
                            <p className="text-2xl font-bold text-green-600">{stats.maintenance.completed}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <ChartBarIcon className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">In Progress</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.maintenance.in_progress}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <CalendarIcon className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Pending</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.maintenance.pending}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <ChartBarIcon className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Maintenance Details Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Maintenance Requests</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parts Used</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {maintenanceDataState && maintenanceDataState.length > 0 ? (
                                maintenanceDataState.map((maintenance) => (
                                    <tr key={maintenance.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {maintenance.report_id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {maintenance.vehicle_type}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {maintenance.issue_title}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                                            {maintenance.parts_used}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                maintenance.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                maintenance.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                                maintenance.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {maintenance.status === 'completed' ? 'Completed' :
                                                 maintenance.status === 'in_progress' ? 'In Progress' :
                                                 maintenance.status === 'pending' ? 'Pending' :
                                                 maintenance.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {maintenance.report_date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <button className="text-blue-600 hover:text-blue-900">View Details</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        No maintenance data available for the selected period
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderDriverReports = () => (
        <div className="space-y-6">
            {/* Driver Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Drivers</p>
                            <p className="text-2xl font-bold text-gray-900">{driverStats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <UserGroupIcon className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Active</p>
                            <p className="text-2xl font-bold text-green-600">{driverStats.active}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <ChartBarIcon className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Average Rating</p>
                            <p className="text-2xl font-bold text-yellow-600">{driverStats.averageRating}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <ChartBarIcon className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Distance</p>
                            <p className="text-2xl font-bold text-gray-900">{driverStats.totalDistance}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <TruckIcon className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Driver Performance Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Driver Performance</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Vehicle</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Deliveries</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {[1, 2, 3, 4, 5].map((item) => (
                                <tr key={item} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">DRV-{String(item).padStart(4, '0')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">John Driver {item}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">DL-{2020 + item}-{1000 * item}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            item <= 3 ? 'bg-green-100 text-green-800' : 
                                            item === 4 ? 'bg-yellow-100 text-yellow-800' : 
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {item <= 3 ? 'Available' : 
                                             item === 4 ? 'On Leave' : 
                                             'Busy'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {item <= 3 ? `TRK-${100 + item}` : 
                                         item === 4 ? 'None' : 
                                         'TRK-105'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{50 * item}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <button className="text-blue-600 hover:text-blue-900">View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'deliveries':
                return renderDeliveryReports();
            case 'maintenance':
                return renderMaintenanceReports();
            case 'drivers':
                return renderDriverReports();
            default:
                return renderDeliveryReports();
        }
    };

    return (
        <AdminLayout authUser={authUser}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
                    <p className="mt-2 text-gray-600">Comprehensive analytics and reports for your logistics operations</p>
                </div>

                {/* Filters Bar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        {/* Date Range Selector */}
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-gray-400" />
                            <select 
                                value={dateRange}
                                onChange={(e) => handleDateRangeChange(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isLoading}
                            >
                                {dateRanges.map(range => (
                                    <option key={range.id} value={range.id}>{range.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                <FilterIcon className="w-4 h-4 text-gray-600" />
                                <span className="text-sm text-gray-700">Filter</span>
                            </button>
                            <button 
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                <DownloadIcon className="w-4 h-4" />
                                <span className="text-sm">Export</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                                            activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {tab.name}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Loading reports...</span>
                    </div>
                ) : (
                    renderContent()
                )}

                {/* Export Confirmation Modal */}
                {showExportModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                                    <DownloadIcon className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Export Report</h3>
                                    <p className="text-sm text-gray-600">Are you sure you want to export the {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} report for {dateRanges.find(r => r.id === dateRange)?.name || dateRange}?</p>
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowExportModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={performExport}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                >
                                    Confirm Export
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
