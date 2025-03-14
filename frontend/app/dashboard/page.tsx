'use client';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useState } from 'react';
import {
    LockClosedIcon,
    Bars3Icon,
    XMarkIcon,
    HomeIcon,
    UserIcon,
    UsersIcon,
    DocumentTextIcon,
    Cog6ToothIcon,
    BellIcon,
} from '@heroicons/react/24/outline';
import { DashboardProvider, useDashboardContext } from './context/DashboardContext';
import { useDashboardSharedContext } from './context/DashboardSharedContext'; // No provider needed here
import DashboardSection from './dashboard/DashboardSection';
import NotesSection from './notes/NotesSection';
import FriendsSection from './friends/FriendsSection';
import ProfileSection from './profile/ProfileSection';
import AccountSettingsSection from './account-settings/AccountSettingsSection';
import NotificationsSection from './notifications/NotificationsSection';

const sectionMap: { [key: string]: React.ComponentType } = {
    dashboard: DashboardSection,
    notes: NotesSection,
    friends: FriendsSection,
    profile: ProfileSection,
    'account-settings': AccountSettingsSection,
    notifications: NotificationsSection,
};

export default function DashboardPage() {
    const { loading } = useDashboardSharedContext();
    const { activeTab, setActiveTab } = useDashboardContext();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    if (loading) return <div className="text-center mt-10">Loading...</div>;

    const ActiveSection = sectionMap[activeTab] || DashboardSection;

    return (
        <DashboardProvider>
            <ProtectedRoute>
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
                                    className="absolute top-6 right-6 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            )}
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className="flex items-center text-gray-900 dark:text-gray-100 text-2xl font-bold mb-8 focus:outline-none"
                            >
                                <LockClosedIcon className="h-8 w-8 mr-2 text-gray-400" />
                                Secure Note
                            </button>
                            <ul className="space-y-2">
                                <li>
                                    <button
                                        onClick={() => setActiveTab('dashboard')}
                                        className={`w-full flex items-center p-2 rounded text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 ${
                                            activeTab === 'dashboard' ? 'bg-gray-200 dark:bg-gray-700' : ''
                                        }`}
                                    >
                                        <HomeIcon className="h-5 w-5 mr-2" />
                                        Dashboard
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className={`w-full flex items-center p-2 rounded text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 ${
                                            activeTab === 'profile' ? 'bg-gray-200 dark:bg-gray-700' : ''
                                        }`}
                                    >
                                        <UserIcon className="h-5 w-5 mr-2" />
                                        Profile
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveTab('friends')}
                                        className={`w-full flex items-center p-2 rounded text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 ${
                                            activeTab === 'friends' ? 'bg-gray-200 dark:bg-gray-700' : ''
                                        }`}
                                    >
                                        <UsersIcon className="h-5 w-5 mr-2" />
                                        Friends
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveTab('notes')}
                                        className={`w-full flex items-center p-2 rounded text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 ${
                                            activeTab === 'notes' ? 'bg-gray-200 dark:bg-gray-700' : ''
                                        }`}
                                    >
                                        <DocumentTextIcon className="h-5 w-5 mr-2" />
                                        Notes
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveTab('account-settings')}
                                        className={`w-full flex items-center p-2 rounded text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 ${
                                            activeTab === 'account-settings' ? 'bg-gray-200 dark:bg-gray-700' : ''
                                        }`}
                                    >
                                        <Cog6ToothIcon className="h-5 w-5 mr-2" />
                                        Account Settings
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveTab('notifications')}
                                        className={`w-full flex items-center p-2 rounded text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 ${
                                            activeTab === 'notifications' ? 'bg-gray-200 dark:bg-gray-700' : ''
                                        }`}
                                    >
                                        <BellIcon className="h-5 w-5 mr-2" />
                                        Notifications
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div
                        className={`flex-1 transition-all duration-300 ${
                            isSidebarOpen ? 'ml-64' : 'ml-0'
                        } p-2 min-h-screen`}
                    >
                        {!isSidebarOpen && (
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="absolute top-4 left-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
                            >
                                <Bars3Icon className="h-6 w-6" />
                            </button>
                        )}
                        <div className="relative bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] border border-gray-200 dark:border-gray-700 w-full min-h-screen mx-auto">
                            {!isSidebarOpen && (
                                <button
                                    onClick={() => setActiveTab('dashboard')}
                                    className="fixed top-4 left-1/2 transform -translate-x-1/2 flex items-center text-gray-900 dark:text-gray-100 text-2xl font-bold z-10 focus:outline-none"
                                >
                                    <LockClosedIcon className="h-8 w-8 mr-2 text-gray-400" />
                                    Secure Note
                                </button>
                            )}
                            <ActiveSection />
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        </DashboardProvider>
    );
}