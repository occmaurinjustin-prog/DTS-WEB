import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import BillingLayout from '@/Layouts/BillingLayout';
import { Calendar, DollarSign, CheckCircle2, AlertCircle, Clock, FileText } from 'lucide-react';

export default function Payroll({ payrolls }) {
    const { errors, flash } = usePage().props;
    
    // Modal state for confirming payment
    const [confirmPayId, setConfirmPayId] = useState(null);
    
    // Filter State
    const [filterDate, setFilterDate] = useState('');

    const filteredPayrolls = payrolls.filter(record => {
        if (!filterDate) return true;
        return filterDate >= record.period_start && filterDate <= record.period_end;
    });

    const handleMarkAsPaid = () => {
        if (confirmPayId) {
            router.patch(`/billing/payroll/${confirmPayId}/pay`, {}, {
                preserveScroll: true,
                onSuccess: () => setConfirmPayId(null)
            });
        }
    };

    return (
        <BillingLayout>
            <Head title="Payroll Management" />

            <div className="max-w-7xl mx-auto pb-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Mechanic Payrolls</h1>
                    <p className="text-slate-500 font-medium text-lg">Manage and settle mechanic salary calculations</p>
                </div>

                {/* Notifications */}
                {flash?.success && (
                    <div className="mb-8 p-4 rounded-2xl bg-emerald-50/50 backdrop-blur-xl border border-emerald-200/50 text-emerald-700 shadow-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        <p className="font-semibold">{flash.success}</p>
                    </div>
                )}
                
                {Object.keys(errors).length > 0 && (
                    <div className="mb-8 p-4 rounded-2xl bg-rose-50/50 backdrop-blur-xl border border-rose-200/50 text-rose-700 shadow-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
                        <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                            {Object.values(errors).map((err, i) => (
                                <p key={i} className="font-semibold">{err}</p>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <FileText className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900">Payroll Records</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <input 
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="rounded-lg border-slate-200 bg-white px-3 py-1.5 text-sm font-medium focus:ring-blue-500 focus:border-blue-500 text-slate-600 shadow-sm"
                                title="Filter by Period Date"
                            />
                            {filterDate && (
                                <button onClick={() => setFilterDate('')} className="text-xs text-rose-500 hover:text-rose-700 font-bold ml-1">
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50/50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Employee & Period</th>
                                    <th className="px-6 py-4">Hours & Rate</th>
                                    <th className="px-6 py-4">Gross Salary</th>
                                    <th className="px-6 py-4 text-rose-500">Deductions</th>
                                    <th className="px-6 py-4">Net Salary</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredPayrolls.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <FileText className="w-12 h-12 mb-3 opacity-20" strokeWidth={1} />
                                                <p className="text-base font-medium">No payroll records found</p>
                                                {filterDate ? (
                                                    <p className="text-sm mt-1">No records cover the date {filterDate}.</p>
                                                ) : (
                                                    <p className="text-sm mt-1">Payrolls generated by Office Staff will appear here.</p>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPayrolls.map((record) => {
                                        const regularHours = record.details?.find(d => d.category === 'regular_hours');
                                        const deductionsAmount = record.details?.filter(d => d.type === 'deductions').reduce((sum, d) => sum + parseFloat(d.amount), 0) || 0;

                                        return (
                                        <tr key={record.payroll_id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">
                                                    {record.user ? `${record.user.firstname || ''} ${record.user.lastname || ''}`.trim() : 'Unknown'}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {record.period_start} to {record.period_end}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-700">{regularHours?.hours || 0} hrs</div>
                                                <div className="text-xs text-slate-500 mt-1">@ ₱{regularHours?.rate || 0}/hr</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-700">
                                                    ₱{record.gross_salary}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-rose-600 font-bold">
                                                {deductionsAmount > 0 ? `- ₱${deductionsAmount.toFixed(2)}` : '₱0.00'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-lg font-black text-blue-600">
                                                    ₱{record.net_salary}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                                                        record.status === 'paid' 
                                                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                                            : 'bg-amber-100 text-amber-700 border border-amber-200'
                                                    }`}>
                                                        {record.status === 'paid' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                        {record.status === 'paid' ? 'Paid' : 'Pending'}
                                                    </span>
                                                    
                                                    {record.status !== 'paid' && (
                                                        <button 
                                                            onClick={() => setConfirmPayId(record.payroll_id)}
                                                            className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-100"
                                                        >
                                                            Mark as Paid
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Custom Confirm Payment Modal */}
            {confirmPayId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-blue-100">
                            <DollarSign className="w-8 h-8 text-blue-500" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 text-center mb-2">Mark as Paid?</h3>
                        <p className="text-slate-500 text-center text-sm font-medium mb-8">
                            This will mark the payroll record as fully settled and paid out. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setConfirmPayId(null)}
                                className="flex-1 px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl transition-colors border border-slate-200"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleMarkAsPaid}
                                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-200"
                            >
                                Yes, Mark Paid
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </BillingLayout>
    );
}
