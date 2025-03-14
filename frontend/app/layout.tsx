'use client';
import '@/app/globals.css';
import { Inter } from 'next/font/google';
import { LockClosedIcon, MoonIcon, SunIcon, UserIcon } from '@heroicons/react/24/outline';
import { useDarkMode } from '@/lib/darkMode';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { DashboardProvider, useDashboardContext } from '@/app/dashboard/context/DashboardContext';
import { DashboardSharedProvider, useDashboardSharedContext } from '@/app/dashboard/context/DashboardSharedContext';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    const pathname = usePathname();
    const isHomePage = pathname === '/';
    const isDashboard = pathname === '/dashboard';
    const [mounted, setMounted] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowProfileDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} bg-gray-100 dark:bg-gray-800 min-h-screen`}>
        <DashboardSharedProvider>
            <DashboardProvider>
                <main className={`relative p-8 ${isHomePage ? 'flex items-center justify-center min-h-screen' : ''}`}>
                    {mounted && (
                        <DashboardControls
                            isDarkMode={isDarkMode}
                            toggleDarkMode={toggleDarkMode}
                            showProfileDropdown={showProfileDropdown}
                            setShowProfileDropdown={setShowProfileDropdown}
                            dropdownRef={dropdownRef}
                            isDashboard={isDashboard}
                        />
                    )}
                    <div className="max-w-4xl mx-auto">
                        {!isHomePage && !isDashboard && mounted && (
                            <div className="flex flex-col items-center mb-10 mt-10">
                                <div className="flex items-center text-gray-900 dark:text-gray-100 text-4xl font-bold">
                                    <LockClosedIcon className="h-12 w-12 mr-4 text-gray-400" />
                                    Secure Note
                                </div>
                            </div>
                        )}
                        {mounted && children}
                    </div>
                </main>
            </DashboardProvider>
        </DashboardSharedProvider>
        </body>
        </html>
    );
}

// Separate component to use context safely
function DashboardControls({
                               isDarkMode,
                               toggleDarkMode,
                               showProfileDropdown,
                               setShowProfileDropdown,
                               dropdownRef,
                               isDashboard,
                           }: {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    showProfileDropdown: boolean;
    setShowProfileDropdown: (value: boolean) => void;
    dropdownRef: React.RefObject<HTMLDivElement | null>;
    isDashboard: boolean;
}) {
    const { user, handleLogout } = useDashboardSharedContext(); // Use shared context
    const { setActiveTab } = useDashboardContext();

    const handleProfileClick = () => {
        setActiveTab('profile');
        setShowProfileDropdown(false);
        if (!isDashboard) {
            window.location.href = '/dashboard';
        }
    };

    return (
        <div className="absolute top-6 right-6 flex gap-2 z-10">
            <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200"
            >
                {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
            </button>
            {user && (
                <div className="relative">
                    <button
                        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200"
                    >
                        <UserIcon className="h-6 w-6" />
                    </button>
                    {showProfileDropdown && (
                        <div
                            ref={dropdownRef}
                            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
                        >
                            <p className="px-4 py-2 text-gray-900 dark:text-gray-100">{user.user.username}</p>
                            <button
                                onClick={handleProfileClick}
                                className="w-full text-left px-4 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                                Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}