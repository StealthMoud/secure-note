'use client';
import { useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useDashboardSharedContext } from '@/app/context/DashboardSharedContext';
import { AdminDashboardProvider, useAdminDashboardContext } from '@/app/context/AdminDashboardContext';
import {
    ChartBarIcon,
    UserIcon,
    DocumentTextIcon,
    ShieldCheckIcon,
    Bars3Icon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import AdminOverview from './overview/page';
import AdminUsers from './users/page';
import AdminNotes from './notes/page';
import AdminVerifyPage from './verify/page';

const sectionMap: { [key: string]: React.ComponentType } = {
    overview: AdminOverview,
    users: AdminUsers,
    notes: AdminNotes,
    verify: AdminVerifyPage,
};

const titleMap: { [key: string]: string } = {
    overview: 'Admin Overview',
    users: 'Manage Users',
    notes: 'Manage Notes',
    verify: 'Verify Users',
};

export default function AdminDashboard() {
    const { user, loading, isSidebarOpen, setIsSidebarOpen } = useDashboardSharedContext();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user || user.role !== 'admin') {
                console.log('Redirecting non-admin to /');
                router.push('/');
            } else if (!isSidebarOpen) {
                console.log('Ensuring sidebar is open on admin load');
                setIsSidebarOpen(true);
            }
        }
    }, [user, loading, router, isSidebarOpen, setIsSidebarOpen]);

    // Log when AdminDashboard renders
    console.log('AdminDashboard rendered, pathname:', pathname);

    if (loading) return <div className="text-center mt-10">Loading...</div>;

    // Handle all /admin/* routes here
    if (!pathname.startsWith('/admin')) return null;

    return (
        <AdminDashboardProvider>
            <AdminDashboardInner />
        </AdminDashboardProvider>
    );
}

function AdminDashboardInner() {
    const { activeTab, setActiveTab, navigateToTab } = useAdminDashboardContext();
    const { isSidebarOpen, setIsSidebarOpen } = useDashboardSharedContext();
    const pathname = usePathname();

    useEffect(() => {
        const currentPath = pathname.split('/admin/')[1] || 'overview';
        console.log(`Current path: /admin/${currentPath}, activeTab: ${activeTab}`);
        if (sectionMap[currentPath] && currentPath !== activeTab) {
            console.log(`Syncing activeTab to ${currentPath} from URL`);
            setActiveTab(currentPath);
        }
        document.title = `${titleMap[activeTab]} | Secure Note`;
    }, [activeTab, setActiveTab, pathname]);

    const handleNavigate = useCallback(
        (tab: string) => {
            console.log(`Navigating to tab: ${tab}, isSidebarOpen before: ${isSidebarOpen}`);
            navigateToTab(tab);
            setTimeout(() => {
                console.log(`Navigated to ${tab}, isSidebarOpen after: ${isSidebarOpen}, current URL: ${window.location.pathname}`);
            }, 0);
        },
        [navigateToTab, isSidebarOpen]
    );

    useEffect(() => {
        console.log('Admin sidebar isSidebarOpen:', isSidebarOpen);
    }, [isSidebarOpen]);

    const ActiveSection = sectionMap[activeTab] || AdminOverview;

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
                    isSidebarOpen ? 'w-64' : 'w-0'
                } overflow-hidden`}
            >
                <div className="p-6 relative h-full">
                    {isSidebarOpen && (
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="group absolute top-6 right-6 p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                        >
                            <XMarkIcon className="h-6 w-6 group-hover:scale-125 transition-transform duration-200" />
                        </button>
                    )}
                    <button
                        onClick={() => handleNavigate('overview')}
                        className="group flex items-center text-gray-900 dark:text-gray-100 text-xl font-bold mb-8 focus:outline-none"
                    >
                        <ShieldCheckIcon className="h-7 w-7 mr-2 text-gray-400 group-hover:scale-125 transition-transform duration-200" />
                        Admin Panel
                    </button>
                    <ul className="space-y-2">
                        <li>
                            <button
                                onClick={() => handleNavigate('overview')}
                                className={`group w-full flex items-center p-2 rounded text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 ${
                                    activeTab === 'overview' ? 'bg-gray-200 dark:bg-gray-700' : ''
                                }`}
                            >
                                <ChartBarIcon className="h-5 w-5 mr-2 group-hover:scale-125 transition-transform duration-200" />
                                Overview
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => handleNavigate('users')}
                                className={`group w-full flex items-center p-2 rounded text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 ${
                                    activeTab === 'users' ? 'bg-gray-200 dark:bg-gray-700' : ''
                                }`}
                            >
                                <UserIcon className="h-5 w-5 mr-2 group-hover:scale-125 transition-transform duration-200" />
                                Users
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => handleNavigate('notes')}
                                className={`group w-full flex items-center p-2 rounded text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 ${
                                    activeTab === 'notes' ? 'bg-gray-200 dark:bg-gray-700' : ''
                                }`}
                            >
                                <DocumentTextIcon className="h-5 w-5 mr-2 group-hover:scale-125 transition-transform duration-200" />
                                Notes
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => handleNavigate('verify')}
                                className={`group w-full flex items-center p-2 rounded text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 ${
                                    activeTab === 'verify' ? 'bg-gray-200 dark:bg-gray-700' : ''
                                }`}
                            >
                                <ShieldCheckIcon className="h-5 w-5 mr-2 group-hover:scale-125 transition-transform duration-200" />
                                Verify Users
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Main Content */}
            <div
                className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'} p-2 min-h-screen`}
            >
                {!isSidebarOpen && (
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="group absolute top-4 left-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <Bars3Icon className="h-6 w-6 group-hover:scale-125 transition-transform duration-200" />
                    </button>
                )}
                <div className="relative bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] border border-gray-200 dark:border-gray-700 w-full min-h-screen mx-auto">
                    <ActiveSection />
                </div>
            </div>
        </div>
    );
}