import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import OfficeStaffLayout from '@/Layouts/OfficeStaffLayout';
import { Calculator, Calendar, DollarSign, User, CheckCircle2, AlertCircle, Clock, FileText } from 'lucide-react';

export default function Payroll({ payrolls, mechanics }) {
    const { errors, flash } = usePage().props;
    
    // Generate Payroll Form State
    const [userId, setUserId] = useState('');
    const [periodStart, setPeriodStart] = useState('');
    const [periodEnd, setPeriodEnd] = useState('');
    const [hourlyRate, setHourlyRate] = useState('62.50');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = (e) => {
        e.preventDefault();
        setIsGenerating(true);
        router.post('/office-staff/payroll/generate', {
            user_id: userId,
            period_start: periodStart,
            period_end: periodEnd,
            hourly_rate: hourlyRate
        }, {
            preserveState: true,
            onFinish: () => setIsGenerating(false),
            onSuccess: () => {
                setUserId('');
                setPeriodStart('');
                setPeriodEnd('');
            }
        });
    };

    return (
        <OfficeStaffLayout>
            <Head title="Payroll Management" />

            <div className="max-w-7xl mx-auto pb-12">
                <div className="mb-10">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Payroll Management</h1>
                    <p className="text-slate-500 font-medium">Generate and track mechanic salary calculations</p>
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

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Generate Form */}
                    <div className="xl:col-span-1 h-fit">
                        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 overflow-hidden sticky top-24">
                            <div className="p-6 border-b border-slate-100/50 bg-white/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <Calculator className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-900">Calculate Salary</h2>
                                </div>
                            </div>
                            
                            <form onSubmit={handleGenerate} className="p-6 space-y-5">
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                        <User className="w-4 h-4 text-slate-400" /> Mechanic
                                    </label>
                                    <select 
                                        required
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                                    >
                                        <option value="" disabled>Select a mechanic</option>
                                        {mechanics.map((mechanic) => (
                                            <option key={mechanic.user_id} value={mechanic.user_id}>
                                                {mechanic.firstname} {mechanic.lastname}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" /> Start Date
                                        </label>
                                        <input 
                                            required
                                            type="date" 
                                            value={periodStart}
                                            onChange={(e) => setPeriodStart(e.target.value)}
                                            className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" /> End Date
                                        </label>
                                        <input 
                                            required
                                            type="date" 
                                            value={periodEnd}
                                            onChange={(e) => setPeriodEnd(e.target.value)}
                                            className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-slate-400" /> Hourly Rate (₱)
                                    </label>
                                    <input 
                                        required
                                        type="number" 
                                        step="0.01"
                                        min="62.50"
                                        value={hourlyRate}
                                        onChange={(e) => setHourlyRate(e.target.value)}
                                        className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                                    />
                                </div>
                                
                                <div className="pt-2">
                                    <button 
                                        type="submit" 
                                        disabled={isGenerating}
                                        className={`w-full py-3.5 text-white rounded-xl transition-all font-bold text-sm flex items-center justify-center gap-2 shadow-lg ${
                                            isGenerating 
                                                ? 'bg-slate-400 shadow-none cursor-not-allowed' 
                                                : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5'
                                        }`}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Calculator className="w-5 h-5" />
                                                Generate Payroll
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Generated Payrolls List */}
                    <div className="xl:col-span-2">
                        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 overflow-hidden">
                            <div className="p-6 border-b border-slate-100/50 bg-white/50 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-900">Recent Payrolls</h2>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-slate-50/50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Employee & Period</th>
                                            <th className="px-6 py-4">Hours & Rate</th>
                                            <th className="px-6 py-4 text-rose-500">Deductions</th>
                                            <th className="px-6 py-4">Net Salary</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100/50">
                                        {payrolls.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                                        <FileText className="w-12 h-12 mb-3 opacity-20" strokeWidth={1} />
                                                        <p className="text-base font-medium">No payroll records generated yet</p>
                                                        <p className="text-sm mt-1">Use the form to calculate a mechanic's salary.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            payrolls.map((record) => (
                                                <tr key={record.payroll_id} className="hover:bg-slate-50/50 transition-colors group">
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
                                                        <div className="font-semibold text-slate-700">{record.total_hours} hrs</div>
                                                        <div className="text-xs text-slate-500 mt-1">@ ₱{record.hourly_rate}/hr</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-rose-600 font-bold">
                                                        {record.deductions > 0 ? `- ₱${record.deductions}` : '₱0.00'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-lg font-black text-indigo-600">
                                                            ₱{record.net_salary}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                                                            record.status === 'paid' 
                                                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                                                : 'bg-amber-100 text-amber-700 border border-amber-200'
                                                        }`}>
                                                            {record.status === 'paid' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                            {record.status === 'paid' ? 'Paid' : 'Pending'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </OfficeStaffLayout>
    );
}
