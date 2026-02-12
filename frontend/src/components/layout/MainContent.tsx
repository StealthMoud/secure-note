'use client';

import Link from 'next/link';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { useDashboardSharedContext } from '@/context/DashboardSharedContext';
import { DashboardControls } from './DashboardControls';
import { NotificationProvider } from '@/context/NotificationContext';

interface MainContentProps {
    pathname: string;
    mounted: boolean;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    showProfileDropdown: boolean;
    setShowProfileDropdown: (value: boolean) => void;
    dropdownRef: React.RefObject<HTMLDivElement | null>;
    children: React.ReactNode;
}

export function MainContent({
    pathname,
    mounted,
    isDarkMode,
    toggleDarkMode,
    showProfileDropdown,
    setShowProfileDropdown,
    dropdownRef,
    children,
}: MainContentProps) {
    const { user } = useDashboardSharedContext();
    const isHomePage = pathname === '/' && !user;
    const isDashboardRoute = user && ['/', '/dashboard', '/notes', '/friends', '/profile', '/account-settings', '/notifications'].includes(pathname);

    return (
        <main className={`relative p-8 ${isHomePage ? 'flex items-center justify-center min-h-screen' : ''}`}>
            {mounted && (
                <NotificationProvider user={user}>
                    <DashboardControls
                        isDarkMode={isDarkMode}
                        toggleDarkMode={toggleDarkMode}
                        showProfileDropdown={showProfileDropdown}
                        setShowProfileDropdown={setShowProfileDropdown}
                        dropdownRef={dropdownRef}
                    />

                    <div className={`w-full ${isDashboardRoute ? '' : 'px-12 md:px-32'}`}>
                        {!isHomePage && !isDashboardRoute && !pathname.startsWith('/admin') && (
                            <div className="flex justify-center mb-12">
                                <Link href="/">
                                    <button className="group relative px-6 py-3 glass rounded-2xl border-white/20 shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
                                        <LockClosedIcon className="h-6 w-6 text-blue-600 transition-transform group-hover:rotate-12" />
                                        <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter italic">
                                            Secure <span className="text-blue-600">Note</span>
                                        </span>
                                    </button>
                                </Link>
                            </div>
                        )}

                        {children}
                    </div>
                </NotificationProvider>
            )}
        </main>
    );
}
