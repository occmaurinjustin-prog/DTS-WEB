import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    Truck, Map, ShieldCheck, Clock, Users, Wrench, 
    BarChart3, Calendar, FileText, Bell, CheckCircle2,
    ChevronRight, LogIn, Menu, X, LocateFixed, Smartphone, Server, Search
} from 'lucide-react';

export default function Landing({ stats }) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [waybill, setWaybill] = useState('');
    const { flash } = usePage().props;

    const handleTrack = (e) => {
        e.preventDefault();
        if (waybill.trim()) {
            router.get(`/track/${waybill.trim()}`);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const navLinks = [
        { name: 'Home', href: '#home' },
        { name: 'About', href: '#about' },
        { name: 'Services', href: '#services' },
        { name: 'Features', href: '#features' },
        { name: 'Contact', href: '#contact' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 scroll-smooth">
            <Head title="DTS Logistics Management System" />

            {/* Navigation */}
            <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-orange-500 p-2 rounded-lg">
                                <Truck className="w-6 h-6 text-white" />
                            </div>
                            <span className={`text-xl font-bold tracking-tight ${scrolled ? 'text-slate-900' : 'text-white'}`}>
                                DTS Logistics
                            </span>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center space-x-8">
                            {navLinks.map((link) => (
                                <a key={link.name} href={link.href} className={`text-sm font-medium hover:text-orange-500 transition-colors ${scrolled ? 'text-slate-600' : 'text-slate-200'}`}>
                                    {link.name}
                                </a>
                            ))}
                        </div>

                        <div className="hidden md:flex items-center">
                            <Link href="/login" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transform hover:-translate-y-0.5">
                                <LogIn className="w-4 h-4" />
                                Login
                            </Link>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center">
                            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`${scrolled ? 'text-slate-900' : 'text-white'}`}>
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-slate-100 absolute w-full shadow-lg">
                        <div className="px-4 pt-2 pb-6 space-y-1">
                            {navLinks.map((link) => (
                                <a key={link.name} href={link.href} className="block px-3 py-3 text-base font-medium text-slate-700 hover:text-orange-500 hover:bg-slate-50 rounded-md" onClick={() => setMobileMenuOpen(false)}>
                                    {link.name}
                                </a>
                            ))}
                            <Link href="/login" className="mt-4 flex justify-center items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-medium w-full">
                                <LogIn className="w-5 h-5" />
                                Login to Dashboard
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section id="home" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-[90vh] flex items-center">
                <div className="absolute inset-0 z-0">
                    <img src="https://images.unsplash.com/photo-1586528116311-ad8ed7c663be?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" alt="Logistics Warehouse" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-transparent"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div 
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                            className="max-w-2xl"
                        >
                            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-orange-400 text-sm font-medium mb-6">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                </span>
                                DTS Logistics Management System v2.0
                            </motion.div>
                            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                                Smart Logistics Management for Faster, Safer, and Smarter Deliveries.
                            </motion.h1>
                            <motion.p variants={fadeUp} className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
                                Manage your fleet, monitor deliveries in real time, assign drivers, track maintenance, and improve operational efficiency through one intelligent platform.
                            </motion.p>
                            
                            {flash?.error && (
                                <motion.div variants={fadeUp} className="bg-red-500/20 backdrop-blur-md border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm font-bold flex items-start gap-3 max-w-lg shadow-lg">
                                    <div className="bg-red-500/30 p-1.5 rounded-lg shrink-0 mt-0.5">
                                        <X className="w-4 h-4 text-red-200" />
                                    </div>
                                    <p className="pt-1">{flash.error}</p>
                                </motion.div>
                            )}

                            <motion.div variants={fadeUp} className="mb-8">
                                <Link 
                                    href="/track" 
                                    className="inline-flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/30 text-lg hover:scale-105"
                                >
                                    <Map className="w-6 h-6" /> Track Delivery
                                </Link>
                            </motion.div>

                            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
                                <Link href="/login" className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-8 py-3.5 rounded-xl font-bold transition-all">
                                    Admin Portal <ChevronRight className="w-5 h-5" />
                                </Link>
                                <a href="#about" className="flex items-center justify-center gap-2 bg-transparent hover:bg-white/5 border border-white/20 text-white px-8 py-3.5 rounded-xl font-bold transition-all">
                                    Learn More
                                </a>
                            </motion.div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="hidden lg:block relative h-[500px]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-transparent rounded-3xl blur-3xl transform -rotate-6"></div>
                            <img src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Trucking" className="relative z-10 w-full h-full object-cover rounded-3xl shadow-2xl border border-white/10" />
                            
                            {/* Floating Stats */}
                            <motion.div 
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -left-12 top-20 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 z-20"
                            >
                                <div className="bg-green-100 p-3 rounded-xl"><CheckCircle2 className="w-6 h-6 text-green-600" /></div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">On-Time Delivery</p>
                                    <p className="text-xl font-bold text-slate-900">99.8%</p>
                                </div>
                            </motion.div>

                            <motion.div 
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -right-8 bottom-32 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 z-20"
                            >
                                <div className="bg-blue-100 p-3 rounded-xl"><LocateFixed className="w-6 h-6 text-blue-600" /></div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Real-Time Tracking</p>
                                    <p className="text-xl font-bold text-slate-900">Active Live</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className="relative z-20 -mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100">
                        <div className="text-center px-4">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 mb-4">
                                <Truck className="w-6 h-6" />
                            </div>
                            <h3 className="text-3xl font-extrabold text-slate-900 mb-1">{stats?.vehicles?.toLocaleString() || 0}</h3>
                            <p className="text-sm font-medium text-slate-500">Fleet Vehicles</p>
                        </div>
                        <div className="text-center px-4">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 mb-4">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-3xl font-extrabold text-slate-900 mb-1">{stats?.users?.toLocaleString() || 0}</h3>
                            <p className="text-sm font-medium text-slate-500">Drivers & Staff</p>
                        </div>
                        <div className="text-center px-4">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-green-50 text-green-500 mb-4">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-3xl font-extrabold text-slate-900 mb-1">{stats?.deliveries?.toLocaleString() || 0}</h3>
                            <p className="text-sm font-medium text-slate-500">Deliveries Completed</p>
                        </div>
                        <div className="text-center px-4">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 mb-4">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <h3 className="text-3xl font-extrabold text-slate-900 mb-1">{stats?.experience || 10}+</h3>
                            <p className="text-sm font-medium text-slate-500">Years Experience</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div 
                            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-orange-500 rounded-3xl transform translate-x-4 translate-y-4 opacity-20"></div>
                            <img src="https://images.unsplash.com/photo-1565891741441-64926e441838?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="About DTS Logistics" className="relative z-10 w-full h-[500px] object-cover rounded-3xl shadow-lg" />
                        </motion.div>
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                            <h4 className="text-orange-500 font-bold uppercase tracking-wider text-sm mb-2">About Our System</h4>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
                                Delivering Excellence Through Intelligent Technology
                            </h2>
                            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                                DTS Logistics provides a state-of-the-art transportation and fleet management solution designed to streamline your entire supply chain. From the moment a delivery is dispatched to its final destination, our system keeps you in complete control.
                            </p>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                We integrate advanced features including real-time maintenance monitoring, live delivery tracking, automated payroll, AI-powered face recognition attendance, and route optimization to ensure peak operational efficiency.
                            </p>
                            <a href="#services" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-medium transition-colors">
                                Explore Capabilities <ChevronRight className="w-4 h-4" />
                            </a>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h4 className="text-orange-500 font-bold uppercase tracking-wider text-sm mb-2">Our Services</h4>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Comprehensive Logistics Solutions</h2>
                        <p className="text-lg text-slate-600">Everything you need to manage your fleet, drivers, and deliveries in one unified platform.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: Truck, title: "Fleet Management", desc: "Manage vehicle assignments, track availability, and oversee your entire fleet operations.", color: "text-blue-500", bg: "bg-blue-50" },
                            { icon: Map, title: "Delivery Tracking", desc: "End-to-end visibility of your deliveries with proof of delivery and status updates.", color: "text-orange-500", bg: "bg-orange-50" },
                            { icon: LocateFixed, title: "GPS Monitoring", desc: "Real-time location tracking for all vehicles to ensure optimal routing and security.", color: "text-green-500", bg: "bg-green-50" },
                            { icon: Wrench, title: "Maintenance Scheduling", desc: "Preventive maintenance alerts, repair tracking, and digital mechanic inspections.", color: "text-red-500", bg: "bg-red-50" },
                            { icon: Users, title: "Face Recognition Attendance", desc: "Secure AI-powered attendance logging with GPS verification for all field staff.", color: "text-purple-500", bg: "bg-purple-50" },
                            { icon: FileText, title: "Payroll Integration", desc: "Automated salary computation based on verified attendance and deductions.", color: "text-teal-500", bg: "bg-teal-50" },
                        ].map((service, idx) => (
                            <motion.div 
                                key={idx}
                                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                                className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${service.bg} transition-transform group-hover:scale-110`}>
                                    <service.icon className={`w-7 h-7 ${service.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{service.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-500/10 to-transparent"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-1">
                            <h4 className="text-orange-400 font-bold uppercase tracking-wider text-sm mb-2">Why Choose Us</h4>
                            <h2 className="text-3xl md:text-4xl font-extrabold mb-6">The DTS Advantage</h2>
                            <p className="text-slate-300 text-lg mb-8">We don't just move freight; we provide the technology to move it smarter, faster, and more securely.</p>
                            <Link href="/login" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-colors">
                                Access Dashboard <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
                            {[
                                { icon: BarChart3, title: "Real-Time Monitoring", desc: "Live dashboards for dispatchers to monitor vehicles, drivers, and delivery statuses in real-time." },
                                { icon: ShieldCheck, title: "AI-Powered Security", desc: "Advanced facial recognition ensures only authorized personnel can log shifts and access vehicles." },
                                { icon: Wrench, title: "Efficient Maintenance", desc: "Reduce downtime with proactive mechanic alerts and seamless repair workflow management." },
                                { icon: Smartphone, title: "Mobile Ecosystem", desc: "Dedicated mobile applications for drivers and mechanics for on-the-go operational updates." },
                            ].map((feature, idx) => (
                                <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors">
                                    <feature.icon className="w-8 h-8 text-orange-400 mb-4" />
                                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                    <p className="text-slate-400">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* System Features */}
            <section id="features" className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">A Complete Platform</h2>
                        <p className="text-lg text-slate-600">Everything interconnected. From the admin office to the mechanic's garage and the driver's cab.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[
                            { name: "Admin Dashboard", icon: Server },
                            { name: "Office Staff Portal", icon: Users },
                            { name: "Driver Mobile App", icon: Smartphone },
                            { name: "Mechanic App", icon: Wrench },
                            { name: "Route Optimization", icon: Map },
                            { name: "Proof of Delivery", icon: CheckCircle2 },
                            { name: "Automated Payroll", icon: FileText },
                            { name: "Push Notifications", icon: Bell },
                        ].map((item, idx) => (
                            <motion.div 
                                key={idx}
                                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                                className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col items-center text-center hover:border-orange-500 hover:shadow-md transition-all group"
                            >
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-50 transition-colors">
                                    <item.icon className="w-6 h-6 text-slate-600 group-hover:text-orange-500 transition-colors" />
                                </div>
                                <h3 className="font-bold text-slate-900">{item.name}</h3>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call To Action */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-blue-950"></div>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">Ready to Modernize Your Logistics Operations?</h2>
                    <p className="text-xl text-slate-300 mb-10">Start managing your fleet smarter today. Access the portal or contact our team for a demo.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/login" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-transform hover:scale-105 shadow-xl shadow-orange-500/20">
                            Login to Portal
                        </Link>
                        <a href="#contact" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors">
                            Contact Us
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="contact" className="bg-slate-950 text-slate-400 py-16 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="bg-orange-500 p-1.5 rounded-lg">
                                    <Truck className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-white tracking-tight">DTS Logistics</span>
                            </div>
                            <p className="text-sm leading-relaxed mb-6">
                                Providing end-to-end transportation and fleet management solutions designed for the modern supply chain.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="text-white font-bold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#home" className="hover:text-orange-400 transition-colors">Home</a></li>
                                <li><a href="#about" className="hover:text-orange-400 transition-colors">About Us</a></li>
                                <li><a href="#services" className="hover:text-orange-400 transition-colors">Services</a></li>
                                <li><a href="#features" className="hover:text-orange-400 transition-colors">System Features</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-4">Platform</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/login" className="hover:text-orange-400 transition-colors">Admin Login</Link></li>
                                <li><Link href="/office-staff/login" className="hover:text-orange-400 transition-colors">Staff Login</Link></li>
                                <li><a href="#" className="hover:text-orange-400 transition-colors">Driver App</a></li>
                                <li><a href="#" className="hover:text-orange-400 transition-colors">Mechanic App</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-4">Contact Info</h4>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-3">
                                    <Map className="w-4 h-4 text-orange-500 mt-0.5" />
                                    <span>123 Logistics Avenue, Industrial Park, Metro City</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-orange-500" />
                                    <span>Support: 24/7 Operations</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="pt-8 border-t border-slate-800 text-sm text-center md:text-left flex flex-col md:flex-row justify-between items-center">
                        <p>&copy; 2026 DTS Logistics Management System. All Rights Reserved.</p>
                        <div className="flex gap-4 mt-4 md:mt-0">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
