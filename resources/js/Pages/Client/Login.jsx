import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    const [isLoaded, setIsLoaded] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post('/client/login');
    };

    return (
        <>
            <Head title="Client Login" />
            
            {/* Global Styles for Animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(3deg); }
                }
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(20px) rotate(-3deg); }
                }
                @keyframes gradient-shift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes slide-in-left {
                    from { opacity: 0; transform: translateX(-50px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes slide-in-right {
                    from { opacity: 0; transform: translateX(50px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse-soft {
                    0%, 100% { opacity: 0.6; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.05); }
                }
                @keyframes truck-bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
                .animate-gradient { background-size: 200% 200%; animation: gradient-shift 8s ease infinite; }
                .animate-slide-left { animation: slide-in-left 0.6s ease-out forwards; }
                .animate-slide-right { animation: slide-in-right 0.6s ease-out forwards; }
                .animate-fade-up { animation: fade-in-up 0.5s ease-out forwards; }
                .animate-pulse-soft { animation: pulse-soft 4s ease-in-out infinite; }
                .animate-truck { animation: truck-bounce 2s ease-in-out infinite; }
                .delay-100 { animation-delay: 100ms; }
                .delay-200 { animation-delay: 200ms; }
                .delay-300 { animation-delay: 300ms; }
                .delay-400 { animation-delay: 400ms; }
                .delay-500 { animation-delay: 500ms; }
                .delay-600 { animation-delay: 600ms; }
            `}</style>

            <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-900">
                
                {/* Background Image with Overlay */}
                <div className="absolute inset-0">
                    <div 
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: "url('/images/dtstruck.jpg')",
                            filter: 'brightness(0.4)',
                        }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-orange-950/50"></div>
                </div>
                
                {/* Main Content Container */}
                <div className={`relative z-10 w-full max-w-4xl mx-4 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                    
                    {/* Split Screen Login Card */}
                    <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row ${isLoaded ? 'animate-scale-in' : ''}`}>
                        
                        {/* LEFT SIDE - Branding (Client Theme - Emerald/Teal) */}
                        <div className={`relative md:w-1/2 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-8 md:p-10 flex flex-col justify-between overflow-hidden animate-gradient ${isLoaded ? 'animate-slide-left' : ''}`}>
                            
                            {/* Decorative Shapes */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse-soft"></div>
                            
                            {/* Wave Pattern */}
                            <svg className="absolute bottom-0 left-0 right-0 text-white/10" viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ height: '60px' }}>
                                <path fill="currentColor" d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,85.3C672,75,768,85,864,101.3C960,117,1056,139,1152,133.3C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                            </svg>
                            
                            {/* Floating Truck Icon */}
                            <div className="absolute top-10 right-10 animate-truck">
                                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                    </svg>
                                </div>
                            </div>
                            
                            {/* Floating Package Icon */}
                            <div className="absolute bottom-32 right-5 animate-float-slow delay-200">
                                <div className="w-12 h-12 bg-white/15 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                            </div>
                            
                            {/* Logo Section */}
                            <div className={`relative z-10 ${isLoaded ? 'animate-fade-up delay-200' : ''}`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                                        <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <span className="text-white font-bold text-xl tracking-tight">DTS</span>
                                </div>
                            </div>
                            
                            {/* Company Info */}
                            <div className={`relative z-10 mt-auto ${isLoaded ? 'animate-fade-up delay-400' : ''}`}>
                                <h2 className="text-white font-bold text-2xl md:text-3xl mb-2 leading-tight">
                                    Client<br/>Portal
                                </h2>
                                <p className="text-white/80 text-sm mt-4 max-w-xs">
                                    Track your deliveries in real-time and manage your shipments with ease.
                                </p>
                            </div>
                            
                            {/* Bottom Badge */}
                            <div className={`relative z-10 mt-6 ${isLoaded ? 'animate-fade-up delay-600' : ''}`}>
                                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    <span className="text-white text-xs font-medium">Service Available</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* RIGHT SIDE - Login Form */}
                        <div className={`md:w-1/2 bg-white p-8 md:p-10 ${isLoaded ? 'animate-slide-right delay-200' : ''}`}>
                            
                            {/* Form Header */}
                            <div className={`mb-6 ${isLoaded ? 'animate-fade-up delay-300' : ''}`}>
                                <h2 className="text-xl font-bold text-gray-900">Client Login</h2>
                                <p className="text-gray-500 text-sm mt-1">Access your delivery dashboard</p>
                            </div>
                            
                            {/* Login Form */}
                            <form className="space-y-4" onSubmit={submit}>
                                
                                {/* Username Input */}
                                <div className={`${isLoaded ? 'animate-fade-up delay-400' : ''}`}>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${focusedField === 'username' ? 'text-emerald-500' : 'text-gray-400'}`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <input
                                            id="username"
                                            name="username"
                                            type="text"
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 hover:border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all duration-200 outline-none"
                                            placeholder="Enter your username"
                                            value={data.username}
                                            onChange={(e) => setData('username', e.target.value)}
                                            onFocus={() => setFocusedField('username')}
                                            onBlur={() => setFocusedField(null)}
                                        />
                                    </div>
                                </div>
                                
                                {/* Password Input */}
                                <div className={`${isLoaded ? 'animate-fade-up delay-500' : ''}`}>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${focusedField === 'password' ? 'text-emerald-500' : 'text-gray-400'}`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 hover:border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all duration-200 outline-none"
                                            placeholder="Enter your password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            onFocus={() => setFocusedField('password')}
                                            onBlur={() => setFocusedField(null)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-emerald-500 transition-colors"
                                        >
                                            {showPassword ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember me and Forgot Password */}
                                <div className={`flex items-center justify-between ${isLoaded ? 'animate-fade-up delay-600' : ''}`}>
                                    <div className="flex items-center">
                                        <input
                                            id="remember-me"
                                            name="remember"
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                                        />
                                        <label 
                                            htmlFor="remember-me" 
                                            className="ml-2 text-xs text-gray-600 cursor-pointer"
                                        >
                                            Remember me
                                        </label>
                                    </div>
                                    <a href="#" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
                                        Forgot Password?
                                    </a>
                                </div>

                                {/* Error Message */}
                                {errors.username && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-xs text-red-600">{errors.username}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Login Button */}
                                <div className={`pt-2 ${isLoaded ? 'animate-fade-up delay-600' : ''}`}>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="group relative w-full flex justify-center py-3 px-4 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0 overflow-hidden"
                                    >
                                        {/* Shimmer Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                                        
                                        {processing ? (
                                            <div className="flex items-center relative z-10">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Signing in...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center relative z-10">
                                                <span>Sign In</span>
                                                <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </form>
                            
                            {/* Footer */}
                            <div className="mt-6 text-center">
                                <p className="text-xs text-gray-400">
                                    © 2024 Delivery Tracking System. All rights reserved.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
