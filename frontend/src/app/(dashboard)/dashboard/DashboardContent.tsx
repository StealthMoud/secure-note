'use client';
import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
    Bars3Icon,
    BellIcon,
    Cog6ToothIcon,
    DocumentTextIcon,
    HomeIcon,
    LockClosedIcon,
    UserIcon,
    UsersIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { usePathname, useRouter } from 'next/navigation';
import { DashboardProvider, useDashboardContext } from '@/context/DashboardContext';
import { useDashboardSharedContext } from '@/context/DashboardSharedContext';
import DashboardSection from './DashboardSection';
import NotesSection from '../notes/NotesSection';
import FriendsSection from '../friends/FriendsSection';
import ProfileSection from '../profile/ProfileSection';
import AccountSettingsSection from '../account-settings/AccountSettingsSection';
import NotificationsSection from '../notifications/NotificationsSection';

const sectionMap: { [key: string]: React.ComponentType } = {
    dashboard: DashboardSection,
    notes: NotesSection,
    friends: FriendsSection,
    profile: ProfileSection,
    'account-settings': AccountSettingsSection,
    notifications: NotificationsSection,
};

const titleMap: { [key: string]: string } = {
    dashboard: 'Dashboard',
    notes: 'Notes',
    friends: 'Friends',
    profile: 'Profile',
    'account-settings': 'Account Settings',
    notifications: 'Notifications',
};

export default function DashboardContent({ defaultTab = 'dashboard' }: { defaultTab?: string }) {
    const { loading, isSidebarOpen, setIsSidebarOpen } = useDashboardSharedContext();

    if (loading) return <div className="text-center mt-10">Loading...</div>;

    return (
        <DashboardProvider>
            <DashboardInner defaultTab={defaultTab} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        </DashboardProvider>
    );
}

function DashboardInner({ defaultTab, isSidebarOpen, setIsSidebarOpen }: {
    defaultTab: string,
    isSidebarOpen: boolean,
    setIsSidebarOpen: (open: boolean) => void
}) {
    const { activeTab, setActiveTab, navigateToTab } = useDashboardContext();
    const { user, notificationCount, refreshNotifications, activeBroadcast } = useDashboardSharedContext();
    const pathname = usePathname();
    const router = useRouter();
    const [dismissedBroadcastId, setDismissedBroadcastId] = useState<string | null>(null);

    useEffect(() => {
        const savedDismissedId = localStorage.getItem('dismissedBroadcastId');
        if (savedDismissedId) setDismissedBroadcastId(savedDismissedId);

        if (user?.role === 'admin' || user?.role === 'superadmin') {
            router.push('/admin/overview');
            return;
        }

        // Sync tab with pathname
        const tabFromPath = pathname === '/' ? 'dashboard' : pathname.replace('/', '');
        const initialTab = sectionMap[tabFromPath] ? tabFromPath : defaultTab;
        if (initialTab !== activeTab) {
            setActiveTab(initialTab);
        }

        const pageTitle = titleMap[activeTab] || 'Dashboard';
        document.title = `${pageTitle} | Secure Note`;
    }, [pathname, setActiveTab, activeTab, defaultTab, user, router]);

    const handleDismissBroadcast = () => {
        if (activeBroadcast) {
            localStorage.setItem('dismissedBroadcastId', activeBroadcast._id);
            setDismissedBroadcastId(activeBroadcast._id);
            refreshNotifications();
        }
    };

    if (user?.role === 'admin' || user?.role === 'superadmin') return null;

    const ActiveSection = sectionMap[activeTab] || DashboardSection;

    const showBroadcast = activeBroadcast && activeBroadcast._id !== dismissedBroadcastId;

    return (
        <ProtectedRoute>
            <div className="flex min-h-screen">
                {/* Sidebar */}
                <div
                    className={`fixed top-0 left-0 h-full glass border-r border-white/10 transition-all duration-500 ease-in-out z-40 ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0 lg:w-0'
                        } overflow-hidden`}
                >
                    <div className="h-full w-72 p-8 flex flex-col custom-scrollbar overflow-y-auto">
                        {/* Logo */}
                        <div className="mb-16 flex items-center gap-4 px-2">
                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3 hover:rotate-6 transition-transform shrink-0">
                                <LockClosedIcon className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter italic leading-none whitespace-nowrap">
                                    Secure<span className="text-blue-600">Note</span>
                                </h1>
                                <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] mt-1 whitespace-nowrap">Personal Vault</p>
                            </div>
                        </div>

                        {/* Nav Links */}
                        <nav className="flex-1 space-y-2">
                            <ul className="space-y-2">
                                {[
                                    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
                                    { id: 'profile', label: 'Profile', icon: UserIcon },
                                    { id: 'notes', label: 'Notes', icon: DocumentTextIcon },
                                    { id: 'friends', label: 'Friends', icon: UsersIcon },
                                    { id: 'account-settings', label: 'Settings', icon: Cog6ToothIcon },
                                    { id: 'notifications', label: 'Notifications', icon: BellIcon, count: notificationCount },
                                ].map((item) => (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => navigateToTab(item.id)}
                                            className={`group w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 relative whitespace-nowrap ${activeTab === item.id
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 font-bold'
                                                : 'text-gray-500 dark:text-gray-400 hover:bg-white/10 hover:text-white hover:translate-x-2'
                                                }`}
                                        >
                                            <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                                            {item.count ? (
                                                <span className={`ml-auto flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-black animate-pulse ${activeTab === item.id ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'}`}>
                                                    {item.count}
                                                </span>
                                            ) : null}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        {/* Sidebar Footer/Toggle */}
                        <div className="pt-8">
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="w-full group flex items-center justify-center p-4 glass rounded-2xl border-white/10 text-gray-400 hover:text-rose-500 transition-all active:scale-95 whitespace-nowrap"
                            >
                                <XMarkIcon className="w-5 h-5 transition-transform group-hover:rotate-90" />
                                <span className="ml-3 text-[10px] font-black uppercase tracking-widest">Collapse View</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div
                    className={`flex-1 transition-all duration-500 ease-in-out ${isSidebarOpen ? 'ml-72' : 'ml-0'
                        } p-4 md:p-8 min-h-screen relative`}
                >
                    {/* Floating Sidebar Toggle (Only when closed) */}
                    {!isSidebarOpen && (
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="fixed top-6 left-6 p-4 glass-premium rounded-full border-white/20 dark:border-white/10 text-gray-900 dark:text-white shadow-2xl z-50 hover:scale-110 active:scale-95 transition-all group backdrop-blur-2xl"
                        >
                            <Bars3Icon className="h-6 w-6 group-hover:rotate-180 transition-transform duration-500" />
                        </button>
                    )}

                    {/* System Broadcast Banner */}
                    {showBroadcast && (
                        <div className={`mb-6 p-4 rounded-2xl glass border border-white/10 flex items-center gap-4 animate-slide-up-fade shadow-xl group ${activeBroadcast.type === 'alert' ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400' :
                            activeBroadcast.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400' :
                                'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
                            }`}>
                            <div className="flex-shrink-0">
                                {activeBroadcast.type === 'alert' && <div className="h-3 w-3 rounded-full bg-red-500 animate-ping" />}
                                {activeBroadcast.type === 'warning' && <div className="h-3 w-3 rounded-full bg-amber-500" />}
                                {activeBroadcast.type === 'info' && <div className="h-3 w-3 rounded-full bg-blue-500" />}
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">System Broadcast</p>
                                <p className="font-bold text-sm md:text-base tracking-tight">{activeBroadcast.message}</p>
                            </div>
                            <button
                                onClick={handleDismissBroadcast}
                                className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-90"
                                aria-label="Dismiss Broadcast"
                            >
                                <XMarkIcon className="w-5 h-5 opacity-40 hover:opacity-100" />
                            </button>
                        </div>
                    )}

                    <div className="relative glass p-6 md:p-10 rounded-[2.5rem] border-white/10 shadow-2xl w-full min-h-[calc(100vh-80px)] mx-auto animate-fade-slide-up">
                        <ActiveSection />
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
