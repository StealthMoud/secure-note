'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useDashboardSharedContext } from '@/app/context/DashboardSharedContext';
import { AdminDashboardProvider } from '@/app/context/AdminDashboardContext';
import {
    ChartBarIcon,
    UserIcon,
    DocumentTextIcon,
    ShieldCheckIcon,
    Bars3Icon,
    XMarkIcon,
    LockClosedIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, isSidebarOpen, setIsSidebarOpen } = useDashboardSharedContext();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        console.log('AdminLayout useEffect - pathname:', pathname, 'isSidebarOpen:', isSidebarOpen, 'user:', user, 'loading:', loading);
        if (!loading) {
            if (!user || user.role !== 'admin') {
                console.log('Redirecting non-admin to /');
                router.push('/');
            } else if (pathname === '/admin') {
                console.log('Redirecting /admin to /admin/overview');
                router.replace('/admin/overview');
            }
        }
    }, [user, loading, router, pathname, setIsSidebarOpen]);

    if (loading) return <div className="text-center mt-10">Loading...</div>;
    if (!pathname.startsWith('/admin')) return null;

    return (
        <AdminDashboardProvider>
            <div className="flex min-h-screen">
                {/* Sidebar */}
                <div
                    className={`fixed top-0 left-0 h-full bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
                        isSidebarOpen ? 'w-64' : 'w-0'
                    } overflow-hidden`}
                >
                    {isSidebarOpen ? (
                        <div className="p-6 relative h-full">
                            <button
                                onClick={() => {
                                    console.log('Collapsing sidebar');
                                    setIsSidebarOpen(false);
                                }}
                                className="group absolute top-6 right-6 p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                            >
                                <XMarkIcon className="h-6 w-6 group-hover:scale-125 transition-transform duration-200" />
                            </button>
                            <button
                                onClick={() => router.push('/admin/overview')}
                                className="group flex items-center text-gray-900 dark:text-gray-100 text-xl font-bold mb-8 focus:outline-none"
                            >
                                <ShieldCheckIcon className="h-7 w-7 mr-2 text-gray-400 group-hover:scale-125 transition-transform duration-200" />
                                Admin Panel
                            </button>
                            <ul className="space-y-2">
                                <li>
                                    <button
                                        onClick={() => router.push('/admin/overview')}
                                        className={`group w-full flex items-center p-2 rounded text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 ${
                                            pathname === '/admin/overview' ? 'bg-gray-200 dark:bg-gray-700' : ''
                                        }`}
                                    >
                                        <ChartBarIcon className="h-5 w-5 mr-2 group-hover:scale-125 transition-transform duration-200" />
                                        Overview
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => router.push('/admin/users')}
                                        className={`group w-full flex items-center p-2 rounded text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 ${
                                            pathname === '/admin/users' ? 'bg-gray-200 dark:bg-gray-700' : ''
                                        }`}
                                    >
                                        <UserIcon className="h-5 w-5 mr-2 group-hover:scale-125 transition-transform duration-200" />
                                        Users
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => router.push('/admin/security-logs')}
                                        className={`group w-full flex items-center p-2 rounded text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 ${
                                            pathname === '/admin/security-logs' ? 'bg-gray-200 dark:bg-gray-700' : ''
                                        }`}
                                    >
                                        <ShieldCheckIcon className="h-5 w-5 mr-2 group-hover:scale-125 transition-transform duration-200" />
                                        Security Logs
                                    </button>
                                </li>
                            </ul>
                        </div>
                    ) : null}
                </div>

                {/* Main Content */}
                <div
                    className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'} p-2 min-h-screen`}
                >
                    <div className="flex justify-center mb-10 mt-10">
                        {isSidebarOpen ? (
                            <div className="h-14" /> // Empty space when sidebar is open
                        ) : (
                            <Link href="/admin/overview">
                                <button className="group flex items-center gap-3 px-4 py-2 bg-transparent border-none cursor-pointer text-gray-900 dark:text-gray-100 text-4xl font-bold">
                                    <LockClosedIcon className="h-10 w-10 text-gray-400 group-hover:scale-125 transition-transform duration-200" />
                                    Secure Note
                                </button>
                            </Link>
                        )}
                    </div>

                    {!isSidebarOpen && (
                        <button
                            onClick={() => {
                                console.log('Opening sidebar');
                                setIsSidebarOpen(true);
                            }}
                            className="group absolute top-4 left-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <Bars3Icon className="h-6 w-6 group-hover:scale-125 transition-transform duration-200" />
                        </button>
                    )}
                    <div className="relative bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] border border-gray-200 dark:border-gray-700 w-full min-h-screen mx-auto">
                        {children}
                    </div>
                </div>
            </div>
        </AdminDashboardProvider>
    );
}