'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useDashboardSharedContext } from '@/context/DashboardSharedContext';
import { AdminDashboardProvider } from '@/context/AdminDashboardContext';
import {
    ChartBarIcon,
    UserIcon,
    DocumentTextIcon,
    ShieldCheckIcon,
    Bars3Icon,
    XMarkIcon,
    LockClosedIcon,
    HomeIcon,
    MegaphoneIcon,
    AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useAdminDashboardContext } from '@/context/AdminDashboardContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, isSidebarOpen, setIsSidebarOpen } = useDashboardSharedContext();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
                router.push('/');
            } else if (pathname === '/admin') {
                router.replace('/admin/overview');
            }
        }
    }, [user, loading, router, pathname]);

    if (loading) return <div className="text-center mt-10">Loading...</div>;
    if (!pathname.startsWith('/admin')) return null;

    const menuItems = [
        { id: 'overview', label: 'Overview', href: '/admin/overview', icon: ChartBarIcon },
        { id: 'users', label: 'Manage Users', href: '/admin/users', icon: UserIcon },
        { id: 'security-logs', label: 'Security Logs', href: '/admin/security-logs', icon: ShieldCheckIcon },
        { id: 'broadcasts', label: 'System Broadcasts', href: '/admin/broadcasts', icon: MegaphoneIcon },
        { id: 'settings', label: 'Account Config', href: '/admin/settings', icon: AdjustmentsHorizontalIcon },
    ];

    return (
        <AdminDashboardProvider>
            <AdminLayoutContent menuItems={menuItems}>{children}</AdminLayoutContent>
        </AdminDashboardProvider>
    );
}

function AdminLayoutContent({ children, menuItems }: { children: React.ReactNode; menuItems: any[] }) {
    const { user, loading, isSidebarOpen, setIsSidebarOpen } = useDashboardSharedContext();
    const router = useRouter();
    const pathname = usePathname();
    const { activeTab, setActiveTab, navigateToTab } = useAdminDashboardContext();

    useEffect(() => {
        if (!loading) {
            if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
                router.push('/');
                return;
            }
            // Sync tab with pathname
            const tabFromPath = pathname.split('/').pop() || 'overview';
            const matchedItem = menuItems.find(item => item.id === tabFromPath || pathname === item.href);
            if (matchedItem && matchedItem.id !== activeTab) {
                setActiveTab(matchedItem.id);
            }
            document.title = `${matchedItem?.label || 'Admin'} | Secure Note`;
        }
    }, [user, loading, pathname, activeTab, setActiveTab]);

    if (loading) return <div className="text-center mt-10">Loading...</div>;
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) return null;

    return (
        <div className="flex min-h-screen transition-colors duration-500">
            {/* floating toggle (visible when sidebar is closed) */}
            {!isSidebarOpen && (
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="fixed top-6 left-6 z-50 p-4 rounded-full glass-premium border border-white/20 dark:border-white/10 shadow-2xl group hover:scale-110 active:scale-95 transition-all text-gray-900 dark:text-white backdrop-blur-2xl"
                >
                    <Bars3Icon className="h-6 w-6 group-hover:rotate-180 transition-transform duration-500" />
                </button>
            )}

            {/* sidebar - premium glass */}
            <aside
                className={`fixed left-0 top-0 z-40 h-screen transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0 lg:w-0'
                    } overflow-hidden`}
            >
                <div className="h-full w-72 overflow-y-auto custom-scrollbar glass border-r border-white/10 py-10 px-6 shadow-2xl relative flex flex-col">
                    <div className="flex items-center gap-4 mb-16 px-2">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3 hover:rotate-6 transition-transform shrink-0">
                            <ShieldCheckIcon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter italic leading-none whitespace-nowrap">
                                Admin<span className="text-blue-600">Core</span>
                            </h1>
                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] mt-1 whitespace-nowrap">System Control</p>
                        </div>
                    </div>

                    <nav className="space-y-2 flex-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => navigateToTab(item.id)}
                                    className="w-full text-left"
                                >
                                    <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group whitespace-nowrap ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 font-bold'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-white/10 hover:text-white hover:translate-x-2'
                                        }`}>
                                        <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </nav>

                    <div className="space-y-4">
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="w-full group flex items-center justify-center p-4 glass rounded-2xl border-white/10 text-gray-400 hover:text-rose-500 transition-all active:scale-95 whitespace-nowrap"
                        >
                            <XMarkIcon className="w-5 h-5 transition-transform group-hover:rotate-90" />
                            <span className="ml-3 text-[10px] font-black uppercase tracking-widest group-hover:block">Retract Panel</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* main content container */}
            <main className={`flex-1 transition-all duration-500 ${isSidebarOpen ? 'lg:ml-72' : 'lg:ml-0'} p-4 md:p-8`}>
                <div className="max-w-7xl mx-auto">
                    <div className="glass min-h-[calc(100vh-4rem)] rounded-2xl p-6 md:p-8 border border-gray-100 dark:border-white/5 shadow-xl">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}