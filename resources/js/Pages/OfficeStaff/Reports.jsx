import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import OfficeStaffLayout from '../../Layouts/OfficeStaffLayout';
import { 
    FileBarChart, CalendarClock, Wrench, PackageSearch, ShoppingCart, 
    BadgeDollarSign, LifeBuoy, Download, FileSpreadsheet, Filter, FileText,
    Clock, Users, AlertTriangle, CheckCircle2, TrendingUp, ChevronDown, Truck
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function StatCard({ label, value, icon: Icon, accent = 'zinc' }) {
    return (
        <div className="bg-white border border-zinc-300 shadow-sm p-4 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all group overflow-hidden relative">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest">{label}</p>
                    <h3 className="text-2xl font-black text-black tracking-tight mt-1">{value}</h3>
                </div>
                <div className="p-2 rounded-lg bg-black text-white group-hover:bg-red-600 transition-colors">
                    <Icon className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
}

// ─── Data Table ───
function DataTable({ headers, rows, emptyMessage = 'No records found' }) {
    return (
        <div className="bg-white border border-zinc-300 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead className="bg-black text-white font-bold uppercase text-[10px] tracking-wider">
                        <tr>
                            {headers.map((h, i) => (
                                <th key={i} className="px-5 py-3.5">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {rows.length > 0 ? rows : (
                            <tr>
                                <td colSpan={headers.length} className="px-5 py-12 text-center text-sm text-zinc-400">
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Status Badge ───
function StatusBadge({ status }) {
    const styles = {
        present: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        absent: 'bg-red-50 text-red-700 border-red-200',
        late: 'bg-amber-50 text-amber-700 border-amber-200',
        pending: 'bg-zinc-100 text-zinc-700 border-zinc-200',
        approved: 'bg-blue-50 text-blue-700 border-blue-200',
        in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
        completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        rejected: 'bg-red-50 text-red-700 border-red-200',
        resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        assigned: 'bg-blue-50 text-blue-700 border-blue-200',
        purchased: 'bg-purple-50 text-purple-700 border-purple-200',
        generated: 'bg-zinc-100 text-zinc-700 border-zinc-200',
        available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        low_stock: 'bg-amber-50 text-amber-700 border-amber-200',
        out_of_stock: 'bg-red-50 text-red-700 border-red-200',
    };
    return (
        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border ${styles[status] || styles.pending}`}>
            {(status || 'unknown').replace(/_/g, ' ')}
        </span>
    );
}

const formatTime = (t) => {
    if (!t) return '--:--';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${m} ${ampm}`;
};

export default function Reports({
    authUser, dateRange: initialDateRange,
    attendanceData, attendanceStats,
    maintenanceData, maintenanceStats,
    inventoryData, inventoryStats,
    partRequestsData, partRequestsStats,
    payrollData, payrollStats,
    rescueData, rescueStats,
    truckData, truckStats,
}) {
    const [activeTab, setActiveTab] = useState('attendance');
    const [dateRange, setDateRange] = useState(initialDateRange || 'month');
    const [isLoading, setIsLoading] = useState(false);

    const tabs = [
        { id: 'attendance', name: 'Attendance', icon: CalendarClock },
        { id: 'maintenance', name: 'Driver Reports', icon: AlertTriangle },
        { id: 'inspections', name: 'Inspections', icon: Wrench },
        { id: 'inventory', name: 'Inventory', icon: PackageSearch },
        { id: 'part_requests', name: 'Part Requests', icon: ShoppingCart },
        { id: 'payroll', name: 'Payroll', icon: BadgeDollarSign },
        { id: 'rescue', name: 'Rescue', icon: LifeBuoy },
        { id: 'trucks', name: 'Trucks', icon: Truck },
    ];

    const dateRanges = [
        { id: 'today', name: 'Today' },
        { id: 'week', name: 'This Week' },
        { id: 'month', name: 'This Month' },
        { id: 'year', name: 'This Year' },
    ];

    const handleDateChange = (range) => {
        setDateRange(range);
        setIsLoading(true);
        router.get('/office-staff/reports', { dateRange: range, tab: activeTab }, {
            preserveState: true,
            preserveScroll: true,
            only: [
                'attendanceData', 'attendanceStats',
                'maintenanceData', 'maintenanceStats',
                'inventoryData', 'inventoryStats',
                'partRequestsData', 'partRequestsStats',
                'payrollData', 'payrollStats',
                'rescueData', 'rescueStats',
                'truckData', 'truckStats',
                'dateRange',
            ],
            onFinish: () => setIsLoading(false),
        });
    };

    // ─── CSV Export ───
    const exportCSV = () => {
        let csv = '';
        let filename = '';
        const ts = new Date().toISOString().split('T')[0];

        switch (activeTab) {
            case 'attendance':
                csv = 'Mechanic,Days Present,Days Absent,Days Late,Half Days,Total Hours\n';
                csv += attendanceData.map(r =>
                    `"${r.mechanic_name}","${r.days_present}","${r.days_absent}","${r.days_late}","${r.days_half_day}","${r.total_hours}"`
                ).join('\n');
                filename = `attendance_summary_report_${dateRange}_${ts}.csv`;
                break;
            case 'maintenance':
                csv = 'Reporter,Truck,Issue,Priority,Status,Total Cost,Date Submitted,Date Resolved\n';
                csv += maintenanceData.filter(r => r.type === 'driver_report').map(r =>
                    `"${r.reporter}","${r.truck}","${r.issue_title}","${r.priority}","${r.status}","${r.total_cost || 0}","${r.date_submitted}","${r.date_resolved || 'N/A'}"`
                ).join('\n');
                filename = `driver_reports_${dateRange}_${ts}.csv`;
                break;
            case 'inspections':
                csv = 'Mechanic,Truck,Condition,Status,Date Submitted,Date Resolved\n';
                csv += maintenanceData.filter(r => r.type === 'inspection').map(r =>
                    `"${r.reporter}","${r.truck}","${r.overall_condition}","${r.status}","${r.date_submitted}","${r.date_resolved || 'N/A'}"`
                ).join('\n');
                filename = `inspections_report_${dateRange}_${ts}.csv`;
                break;
            case 'inventory':
                csv = 'Part Name,Category,Current Stock,Min Stock Level,Status\n';
                csv += inventoryData.map(r =>
                    `"${r.part_name}","${r.category}","${r.quantity}","${r.min_stock_level}","${r.status}"`
                ).join('\n');
                filename = `inventory_report_${dateRange}_${ts}.csv`;
                break;
            case 'part_requests':
                csv = 'Mechanic,Part Name,Quantity,Reason,Status,Date Requested\n';
                csv += partRequestsData.map(r =>
                    `"${r.mechanic_name}","${r.part_name}","${r.quantity}","${r.reason}","${r.status}","${r.date_requested}"`
                ).join('\n');
                filename = `part_requests_report_${dateRange}_${ts}.csv`;
                break;
            case 'trucks':
                csv = 'Truck ID,Plate Number,Type,Total Maintenance,Total Rescues\n';
                csv += truckData.map(r =>
                    `"${r.unique_id}","${r.plate_number}","${r.vehicle_type}","${r.total_maintenance}","${r.total_rescues}"`
                ).join('\n');
                filename = `truck_report_${dateRange}_${ts}.csv`;
                break;
            case 'payroll':
                csv = 'Mechanic,Period Start,Period End,Total Hours,Gross Pay,Net Pay,Status\n';
                csv += payrollData.map(r =>
                    `"${r.mechanic_name}","${r.period_start}","${r.period_end}","${r.total_hours}","${r.gross_pay}","${r.net_pay}","${r.status}"`
                ).join('\n');
                filename = `payroll_report_${dateRange}_${ts}.csv`;
                break;
            case 'rescue':
                csv = 'Date,Driver,Truck,Issue Category,Address,Mechanic,Status\n';
                csv += rescueData.map(r =>
                    `"${r.date}","${r.driver_name}","${r.truck}","${r.issue_category}","${r.address}","${r.mechanic_name}","${r.status}"`
                ).join('\n');
                filename = `rescue_report_${dateRange}_${ts}.csv`;
                break;
        }

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ─── PDF Export ───
    const exportPDF = () => {
        const doc = new jsPDF('landscape');
        const ts = new Date().toISOString().split('T')[0];
        const tabLabel = tabs.find(t => t.id === activeTab)?.name || activeTab;
        const rangeLabel = dateRanges.find(d => d.id === dateRange)?.name || dateRange;

        // Header
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text(`${tabLabel} Report`, 14, 20);
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100);
        doc.text(`Period: ${rangeLabel}  |  Generated: ${new Date().toLocaleString()}  |  By: ${authUser?.firstname || 'Office Staff'} ${authUser?.lastname || ''}`, 14, 28);
        doc.setTextColor(0);

        let headers = [];
        let body = [];

        switch (activeTab) {
            case 'attendance':
                headers = ['Mechanic', 'Present', 'Absent', 'Late', 'Half Day', 'Total Hours'];
                body = attendanceData.map(r => [r.mechanic_name, r.days_present, r.days_absent, r.days_late, r.days_half_day, r.total_hours]);
                break;
            case 'maintenance':
                headers = ['Reporter', 'Truck', 'Issue', 'Priority', 'Status', 'Submitted', 'Resolved'];
                body = maintenanceData.filter(r => r.type === 'driver_report').map(r => [r.reporter, r.truck, r.issue_title, r.priority, r.status, r.date_submitted, r.date_resolved || '-']);
                break;
            case 'inspections':
                headers = ['Mechanic', 'Truck', 'Condition', 'Status', 'Submitted', 'Resolved'];
                body = maintenanceData.filter(r => r.type === 'inspection').map(r => [r.reporter, r.truck, r.overall_condition, r.status, r.date_submitted, r.date_resolved || '-']);
                break;
            case 'inventory':
                headers = ['Part Name', 'Category', 'Stock', 'Min Level', 'Status'];
                body = inventoryData.map(r => [r.part_name, r.category, r.quantity, r.min_stock_level, r.status.replace(/_/g, ' ')]);
                break;
            case 'part_requests':
                headers = ['Mechanic', 'Part', 'Qty', 'Reason', 'Status', 'Date'];
                body = partRequestsData.map(r => [r.mechanic_name, r.part_name, r.quantity, r.reason, r.status, r.date_requested]);
                break;
            case 'trucks':
                headers = ['Truck ID', 'Plate Number', 'Type', 'Total Maint.', 'Total Rescues'];
                body = truckData.map(r => [r.unique_id, r.plate_number, r.vehicle_type, r.total_maintenance, r.total_rescues]);
                break;
            case 'payroll':
                headers = ['Mechanic', 'Period Start', 'Period End', 'Hours', 'Gross Pay', 'Net Pay', 'Status'];
                body = payrollData.map(r => [r.mechanic_name, r.period_start, r.period_end, r.total_hours, `₱${Number(r.gross_pay).toLocaleString()}`, `₱${Number(r.net_pay).toLocaleString()}`, r.status]);
                break;
            case 'rescue':
                headers = ['Date', 'Driver', 'Truck', 'Category', 'Mechanic', 'Status'];
                body = rescueData.map(r => [r.date, r.driver_name, r.truck, r.issue_category, r.mechanic_name, r.status]);
                break;
        }

        autoTable(doc, {
            startY: 34,
            head: [headers],
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [24, 24, 27], fontSize: 8, fontStyle: 'bold' },
            bodyStyles: { fontSize: 8 },
            alternateRowStyles: { fillColor: [250, 250, 250] },
            margin: { left: 14, right: 14 },
        });

        // Summary stats footer
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.text('Summary Statistics', 14, finalY);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(8);

        let summaryLines = [];
        switch (activeTab) {
            case 'attendance':
                summaryLines = [`Total Mechanics: ${attendanceStats.total_mechanics}`, `Total Hours: ${attendanceStats.total_hours}`, `Avg Hours/Day: ${attendanceStats.avg_hours}`, `Late Count: ${attendanceStats.total_late}`];
                break;
            case 'maintenance':
                summaryLines = [`Total Driver Reports: ${maintenanceData.filter(r => r.type === 'driver_report').length}`, `Pending: ${maintenanceData.filter(r => r.type === 'driver_report' && r.status === 'pending').length}`, `Completed: ${maintenanceData.filter(r => r.type === 'driver_report' && r.status === 'completed').length}`];
                break;
            case 'inspections':
                summaryLines = [`Total Inspections: ${maintenanceData.filter(r => r.type === 'inspection').length}`, `Pending: ${maintenanceData.filter(r => r.type === 'inspection' && r.status === 'pending').length}`, `Completed: ${maintenanceData.filter(r => r.type === 'inspection' && r.status === 'completed').length}`];
                break;
            case 'inventory':
                summaryLines = [`Total Parts: ${inventoryStats.total_parts}`, `Low Stock: ${inventoryStats.low_stock}`, `Out of Stock: ${inventoryStats.out_of_stock}`, `Stock In (Period): ${inventoryStats.stock_in}`, `Stock Out (Period): ${inventoryStats.stock_out}`];
                break;
            case 'part_requests':
                summaryLines = [`Total: ${partRequestsStats.total}`, `Pending: ${partRequestsStats.pending}`, `Approved: ${partRequestsStats.approved}`, `Completed: ${partRequestsStats.completed}`, `Rejected: ${partRequestsStats.rejected}`];
                break;
            case 'trucks':
                summaryLines = [`Total Trucks: ${truckStats.total_trucks}`, `Active: ${truckStats.active_trucks}`, `Maint. Needed: ${truckStats.maintenance_needed}`, `Total Maintenance Records: ${truckStats.total_maintenance_records}`, `Total Rescue Records: ${truckStats.total_rescue_records}`];
                break;
            case 'payroll':
                summaryLines = [`Total Records: ${payrollStats.total_records}`, `Total Gross: ₱${Number(payrollStats.total_gross).toLocaleString()}`, `Total Net: ₱${Number(payrollStats.total_net).toLocaleString()}`, `Avg Hours: ${payrollStats.avg_hours}`];
                break;
            case 'rescue':
                summaryLines = [`Total Incidents: ${rescueStats.total}`, `Resolved: ${rescueStats.resolved}`, `Pending: ${rescueStats.pending}`];
                break;
        }
        summaryLines.forEach((line, i) => {
            doc.text(line, 14 + (i % 3) * 90, finalY + 6 + Math.floor(i / 3) * 5);
        });

        // Page numbers
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
        }

        doc.save(`${activeTab}_report_${dateRange}_${ts}.pdf`);
    };

    // ─── Tab Content Renderers ───
    const renderAttendance = () => (
        <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <StatCard label="Total Mechanics" value={attendanceStats.total_mechanics} icon={Users} />
                <StatCard label="Total Hours" value={attendanceStats.total_hours} icon={Clock} accent="emerald" />
                <StatCard label="Avg Hours/Day" value={attendanceStats.avg_hours} icon={TrendingUp} accent="blue" />
                <StatCard label="Late Count" value={attendanceStats.total_late} icon={AlertTriangle} accent="amber" />
                <StatCard label="Absent" value={attendanceStats.absent_count} icon={Users} accent="red" />
            </div>
            <DataTable
                headers={['Mechanic', 'Days Present', 'Days Absent', 'Days Late', 'Half Days', 'Total Hours']}
                rows={attendanceData.map((r, i) => (
                    <tr key={i} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-5 py-3 text-sm font-semibold text-zinc-900">{r.mechanic_name}</td>
                        <td className="px-5 py-3 text-sm text-zinc-600">{r.days_present}</td>
                        <td className="px-5 py-3 text-sm text-zinc-600">{r.days_absent}</td>
                        <td className="px-5 py-3 text-sm text-zinc-600">{r.days_late}</td>
                        <td className="px-5 py-3 text-sm text-zinc-600">{r.days_half_day}</td>
                        <td className="px-5 py-3 text-sm font-bold text-zinc-900">{r.total_hours}h</td>
                    </tr>
                ))}
            />
        </>
    );

    const renderMaintenance = () => {
        const driverReports = maintenanceData.filter(r => r.type === 'driver_report');
        return (
        <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <StatCard label="Total Reports" value={driverReports.length} icon={FileBarChart} />
                <StatCard label="Pending" value={driverReports.filter(r => r.status === 'pending').length} icon={Clock} accent="amber" />
                <StatCard label="Completed" value={driverReports.filter(r => r.status === 'completed').length} icon={CheckCircle2} accent="emerald" />
            </div>
            <DataTable
                headers={['Reporter', 'Truck', 'Issue', 'Priority', 'Status', 'Total Cost', 'Submitted', 'Resolved']}
                rows={driverReports.map((r, i) => (
                    <tr key={i} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-5 py-3 text-sm font-semibold text-zinc-900">{r.reporter}</td>
                        <td className="px-5 py-3 text-sm text-zinc-600 font-mono">{r.truck}</td>
                        <td className="px-5 py-3 text-sm text-zinc-600 max-w-[200px] truncate">{r.issue_title}</td>
                        <td className="px-5 py-3"><StatusBadge status={r.priority} /></td>
                        <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                        <td className="px-5 py-3 text-sm font-bold text-red-600">₱{parseFloat(r.total_cost || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        <td className="px-5 py-3 text-sm text-zinc-500">{r.date_submitted}</td>
                        <td className="px-5 py-3 text-sm text-zinc-500">{r.date_resolved || '—'}</td>
                    </tr>
                ))}
            />
        </>
        );
    };

    const renderInspections = () => {
        const inspections = maintenanceData.filter(r => r.type === 'inspection');
        return (
        <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <StatCard label="Total Inspections" value={inspections.length} icon={FileBarChart} />
                <StatCard label="Pending" value={inspections.filter(r => r.status === 'pending').length} icon={Clock} accent="amber" />
                <StatCard label="Completed" value={inspections.filter(r => r.status === 'completed').length} icon={CheckCircle2} accent="emerald" />
            </div>
            <DataTable
                headers={['Mechanic', 'Truck', 'Condition', 'Status', 'Submitted', 'Resolved']}
                rows={inspections.map((r, i) => (
                    <tr key={i} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-5 py-3 text-sm font-semibold text-zinc-900">{r.reporter}</td>
                        <td className="px-5 py-3 text-sm text-zinc-600 font-mono">{r.truck}</td>
                        <td className="px-5 py-3 text-sm text-zinc-600 capitalize">{r.overall_condition}</td>
                        <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                        <td className="px-5 py-3 text-sm text-zinc-500">{r.date_submitted}</td>
                        <td className="px-5 py-3 text-sm text-zinc-500">{r.date_resolved || '—'}</td>
                    </tr>
                ))}
            />
        </>
        );
    };

    const renderInventory = () => (
        <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <StatCard label="Total Parts" value={inventoryStats.total_parts} icon={PackageSearch} />
                <StatCard label="Low Stock" value={inventoryStats.low_stock} icon={AlertTriangle} accent="amber" />
                <StatCard label="Out of Stock" value={inventoryStats.out_of_stock} icon={AlertTriangle} accent="red" />
                <StatCard label="Stock In (Period)" value={inventoryStats.stock_in} icon={TrendingUp} accent="emerald" />
                <StatCard label="Stock Out (Period)" value={inventoryStats.stock_out} icon={TrendingUp} accent="blue" />
            </div>
            <DataTable
                headers={['Part Name', 'Category', 'Current Stock', 'Min Level', 'Status']}
                rows={inventoryData.map((r, i) => (
                    <tr key={i} className={`hover:bg-zinc-50 transition-colors ${r.status === 'out_of_stock' ? 'bg-red-50/30' : r.status === 'low_stock' ? 'bg-amber-50/30' : ''}`}>
                        <td className="px-5 py-3 text-sm font-semibold text-zinc-900">{r.part_name}</td>
                        <td className="px-5 py-3 text-sm text-zinc-600">{r.category}</td>
                        <td className="px-5 py-3 text-sm font-bold text-zinc-900">{r.quantity}</td>
                        <td className="px-5 py-3 text-sm text-zinc-500">{r.min_stock_level}</td>
                        <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                    </tr>
                ))}
            />
        </>
    );

    const renderPartRequests = () => (
        <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <StatCard label="Total Requests" value={partRequestsStats.total} icon={ShoppingCart} />
                <StatCard label="Pending" value={partRequestsStats.pending} icon={Clock} accent="amber" />
                <StatCard label="Approved" value={partRequestsStats.approved} icon={CheckCircle2} accent="blue" />
                <StatCard label="Completed" value={partRequestsStats.completed} icon={CheckCircle2} accent="emerald" />
                <StatCard label="Rejected" value={partRequestsStats.rejected} icon={AlertTriangle} accent="red" />
            </div>
            <DataTable
                headers={['Mechanic', 'Part Name', 'Quantity', 'Reason', 'Status', 'Date Requested']}
                rows={partRequestsData.map((r, i) => (
                    <tr key={i} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-5 py-3 text-sm font-semibold text-zinc-900">{r.mechanic_name}</td>
                        <td className="px-5 py-3 text-sm text-zinc-600">{r.part_name}</td>
                        <td className="px-5 py-3 text-sm font-bold text-zinc-900">{r.quantity}</td>
                        <td className="px-5 py-3 text-sm text-zinc-500 max-w-[250px] truncate">{r.reason}</td>
                        <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                        <td className="px-5 py-3 text-sm text-zinc-500">{r.date_requested}</td>
                    </tr>
                ))}
            />
        </>
    );

    const renderPayroll = () => (
        <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard label="Total Records" value={payrollStats.total_records} icon={FileBarChart} />
                <StatCard label="Total Gross" value={`₱${Number(payrollStats.total_gross).toLocaleString()}`} icon={BadgeDollarSign} accent="emerald" />
                <StatCard label="Total Net" value={`₱${Number(payrollStats.total_net).toLocaleString()}`} icon={BadgeDollarSign} accent="blue" />
                <StatCard label="Avg Hours" value={payrollStats.avg_hours} icon={Clock} accent="zinc" />
            </div>
            <DataTable
                headers={['Mechanic', 'Period Start', 'Period End', 'Total Hours', 'Gross Pay', 'Net Pay', 'Status']}
                rows={payrollData.map((r, i) => (
                    <tr key={i} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-5 py-3 text-sm font-semibold text-zinc-900">{r.mechanic_name}</td>
                        <td className="px-5 py-3 text-sm text-zinc-600">{r.period_start}</td>
                        <td className="px-5 py-3 text-sm text-zinc-600">{r.period_end}</td>
                        <td className="px-5 py-3 text-sm font-bold text-zinc-900">{r.total_hours}h</td>
                        <td className="px-5 py-3 text-sm font-semibold text-emerald-700">₱{Number(r.gross_pay).toLocaleString()}</td>
                        <td className="px-5 py-3 text-sm font-bold text-zinc-900">₱{Number(r.net_pay).toLocaleString()}</td>
                        <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                    </tr>
                ))}
            />
        </>
    );

    const renderRescue = () => (
        <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <StatCard label="Total Incidents" value={rescueStats.total} icon={LifeBuoy} />
                <StatCard label="Resolved" value={rescueStats.resolved} icon={CheckCircle2} accent="emerald" />
                <StatCard label="Pending" value={rescueStats.pending} icon={Clock} accent="amber" />
            </div>
            <DataTable
                headers={['Date', 'Driver', 'Truck', 'Issue Category', 'Mechanic', 'Status']}
                rows={rescueData.map((r, i) => (
                    <tr key={i} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-5 py-3 text-sm text-zinc-600">{r.date}</td>
                        <td className="px-5 py-3 text-sm font-semibold text-zinc-900">{r.driver_name}</td>
                        <td className="px-5 py-3 text-sm text-zinc-600 font-mono">{r.truck}</td>
                        <td className="px-5 py-3 text-sm text-zinc-600">{r.issue_category}</td>
                        <td className="px-5 py-3 text-sm font-semibold text-zinc-800">{r.mechanic_name}</td>
                        <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                    </tr>
                ))}
            />
        </>
    );

    const renderTrucks = () => (
        <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <StatCard label="Total Trucks" value={truckStats.total_trucks} icon={Truck} />
                <StatCard label="Active" value={truckStats.active_trucks} icon={CheckCircle2} accent="emerald" />
                <StatCard label="Maintenance Needed" value={truckStats.maintenance_needed} icon={Wrench} accent="amber" />
                <StatCard label="Total Maintenance" value={truckStats.total_maintenance_records} icon={Wrench} accent="blue" />
                <StatCard label="Total Rescues" value={truckStats.total_rescue_records} icon={LifeBuoy} accent="red" />
            </div>
            <DataTable
                headers={['Truck ID', 'Plate Number', 'Vehicle Type', 'Total Maintenance', 'Total Rescues']}
                rows={truckData.map((r, i) => (
                    <tr key={i} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-5 py-3 text-sm font-mono text-zinc-600">{r.unique_id}</td>
                        <td className="px-5 py-3 text-sm font-bold text-zinc-900">{r.plate_number}</td>
                        <td className="px-5 py-3 text-sm text-zinc-600 capitalize">{r.vehicle_type}</td>
                        <td className="px-5 py-3 text-sm font-bold text-zinc-900">{r.total_maintenance}</td>
                        <td className="px-5 py-3 text-sm font-bold text-zinc-900">{r.total_rescues}</td>
                    </tr>
                ))}
            />
        </>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'attendance': return renderAttendance();
            case 'maintenance': return renderMaintenance();
            case 'inspections': return renderInspections();
            case 'inventory': return renderInventory();
            case 'part_requests': return renderPartRequests();
            case 'payroll': return renderPayroll();
            case 'rescue': return renderRescue();
            case 'trucks': return renderTrucks();
            default: return null;
        }
    };

    return (
        <OfficeStaffLayout title="Reports" authUser={authUser} activeMenu="reports">
            <Head title="Reports" />

            <div className="max-w-7xl pb-12">
                {/* Header Bar */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900">Reports</h1>
                        <p className="text-zinc-500 text-sm">Generate and export operational reports for admin review.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Date Range Selector */}
                        <div className="relative">
                            <select
                                value={dateRange}
                                onChange={(e) => handleDateChange(e.target.value)}
                                className="appearance-none bg-white border border-zinc-200 text-zinc-700 text-sm font-medium px-4 py-2 pr-9 focus:outline-none focus:border-zinc-400 transition-colors cursor-pointer"
                            >
                                {dateRanges.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                        </div>

                        {/* Export Buttons */}
                        <button onClick={exportCSV} className="flex-1 sm:flex-none px-4 py-2 bg-white border border-black text-black hover:bg-red-50 hover:text-red-700 hover:border-red-600 transition-colors flex items-center justify-center gap-2 font-medium text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-y-0 hover:translate-y-[2px] hover:translate-x-[2px]">
                            <Download className="w-4 h-4" /> Export CSV
                        </button>
                        <button onClick={exportPDF} className="flex-1 sm:flex-none px-4 py-2 bg-white border border-black text-black hover:bg-red-50 hover:text-red-700 hover:border-red-600 transition-colors flex items-center justify-center gap-2 font-medium text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-y-0 hover:translate-y-[2px] hover:translate-x-[2px]">
                            <FileText className="w-4 h-4" /> Export PDF
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 mb-8 border-b border-zinc-200 pb-2">
                    {tabs.map(tab => {
                        const TabIcon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); router.get('/office-staff/reports', { tab: tab.id, dateRange }, { preserveState: true }); }}
                                className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-all border ${
                                    activeTab === tab.id
                                        ? 'bg-red-600 text-white border-red-600 shadow-md'
                                        : 'bg-white text-zinc-500 hover:text-black border-transparent hover:bg-zinc-100 hover:border-black'
                                }`}
                            >
                                <TabIcon className="w-4 h-4" strokeWidth={2} />
                                {tab.name}
                            </button>
                        );
                    })}
                </div>

                {/* Loading Overlay */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="flex items-center gap-3 text-zinc-500">
                            <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
                            <span className="text-sm font-medium">Loading report data...</span>
                        </div>
                    </div>
                )}

                {/* Tab Content */}
                {!isLoading && renderContent()}
            </div>
        </OfficeStaffLayout>
    );
}
