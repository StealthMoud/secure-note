'use client';
import '@/app/globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import Head from 'next/head';
import {
    LockClosedIcon,
    MoonIcon,
    SunIcon,
    UserIcon,
    CheckCircleIcon,
    BellIcon,
    ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useDarkMode } from '@/lib/darkMode';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { DashboardSharedProvider, useDashboardSharedContext } from '@/app/context/DashboardSharedContext';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    const pathname = usePathname();
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
        <Head>
            <link rel="icon" href="/frontend/public/favicon.ico?v=1" />
        </Head>
        <body className={`${inter.className} bg-gray-100 dark:bg-gray-800 min-h-screen`}>
        <DashboardSharedProvider>
            <MainContent
                pathname={pathname}
                mounted={mounted}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                showProfileDropdown={showProfileDropdown}
                setShowProfileDropdown={setShowProfileDropdown}
                dropdownRef={dropdownRef}
                children={children}
            />
        </DashboardSharedProvider>
        </body>
        </html>
    );
}

function MainContent({
                         pathname,
                         mounted,
                         isDarkMode,
                         toggleDarkMode,
                         showProfileDropdown,
                         setShowProfileDropdown,
                         dropdownRef,
                         children,
                     }: {
    pathname: string;
    mounted: boolean;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    showProfileDropdown: boolean;
    setShowProfileDropdown: (value: boolean) => void;
    dropdownRef: React.RefObject<HTMLDivElement | null>;
    children: React.ReactNode;
}) {
    const { user, isSidebarOpen } = useDashboardSharedContext();
    const isHomePage = pathname === '/' && !user;
    const isDashboardRoute = user && ['/', '/notes', '/friends', '/profile', '/account-settings', '/notifications'].includes(pathname);

    return (
        <main className={`relative p-8 ${isHomePage ? 'flex items-center justify-center min-h-screen' : ''}`}>
            {mounted && (
                <DashboardControls
                    isDarkMode={isDarkMode}
                    toggleDarkMode={toggleDarkMode}
                    showProfileDropdown={showProfileDropdown}
                    setShowProfileDropdown={setShowProfileDropdown}
                    dropdownRef={dropdownRef}
                />
            )}

            <div className="w-full px-32">
                {!isHomePage && !isDashboardRoute && mounted && (
                    <div className="flex justify-center mb-10 mt-10">
                        <Link href="/">
                            <button className="group flex items-center gap-3 px-4 py-2 bg-transparent border-none cursor-pointer text-gray-900 dark:text-gray-100 text-4xl font-bold">
                                <LockClosedIcon className="h-10 w-10 text-gray-400 group-hover:scale-125 transition-transform duration-200" />
                                Secure Note
                            </button>

                        </Link>
                    </div>
                )}

                {mounted && children}
            </div>
        </main>
    );
}

function DashboardControls({
                               isDarkMode,
                               toggleDarkMode,
                               showProfileDropdown,
                               setShowProfileDropdown,
                               dropdownRef,
                           }: {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    showProfileDropdown: boolean;
    setShowProfileDropdown: (value: boolean) => void;
    dropdownRef: React.RefObject<HTMLDivElement | null>;
}) {
    const { user, handleLogout } = useDashboardSharedContext();
    const router = useRouter();

    // Reset dropdown on user change (e.g., login) to prevent auto-open
    useEffect(() => {
        setShowProfileDropdown(false);
    }, [user, setShowProfileDropdown]);

    const handleProfileClick = () => {
        setShowProfileDropdown(false);
        router.push('/profile');
    };

    const handleNotificationsClick = () => {
        router.push('/notifications');
    };

    // Avatar URL construction
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002';
    const avatarUrl = user?.user.avatar ? `${backendUrl}${user.user.avatar}?t=${Date.now()}` : '/default-avatar.jpg';

    return (
        <div className="absolute top-6 right-6 flex gap-2 z-10">
            {/* Dark Mode Toggle */}
            <button
                onClick={toggleDarkMode}
                className="group p-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-200"
            >
                {isDarkMode ? (
                    <SunIcon className="h-7 w-7 group-hover:scale-125 transition-transform duration-200" />
                ) : (
                    <MoonIcon className="h-7 w-7 group-hover:scale-125 transition-transform duration-200" />
                )}
            </button>


            {/* Notification and Profile (only when logged in) */}
            {user && (
                <>
                    {/* Notification Icon */}
                    <button
                        onClick={handleNotificationsClick}
                        className="group p-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-200"
                    >
                        <BellIcon className="h-7 w-7 group-hover:scale-125 transition-transform duration-200" />
                    </button>


                    {/* Profile Dropdown */}
                    <div className="relative flex items-center gap-2">
                        {/* Profile Toggle Button with Avatar and Verification Icon */}
                        <div className="relative group">
                            <button
                                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                className="p-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-200"
                            >
                                <img
                                    src={avatarUrl}
                                    alt="User Avatar"
                                    className="h-12 w-12 rounded-full object-cover group-hover:scale-125 transition-transform duration-200"
                                />
                            </button>

                            {/* Verification Icon Overlapping Bottom Right */}
                            <CheckCircleIcon
                                className={`absolute bottom-0 right-0 h-4 w-4 ${
                                    user.user.verified ? 'text-green-500' : 'text-red-500'
                                }`}
                                aria-label={user.user.verified ? 'Verified' : 'Not Verified'}
                            />
                        </div>


                        {/* Dropdown */}
                        {showProfileDropdown && (
                            <div
                                ref={dropdownRef}
                                className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
                            >
                                {/* Username, Nickname, Avatar */}
                                <div className="flex items-center px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                                    <img
                                        src={avatarUrl}
                                        alt="User Avatar"
                                        className="h-8 w-8 rounded-full object-cover mr-2"
                                    />
                                    <div>
                                        <p className="text-gray-900 dark:text-gray-100 font-semibold">
                                            {user.user.username}
                                        </p>
                                        {user.user.nickname && (
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                {user.user.nickname}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Profile Link */}
                                <button
                                    onClick={handleProfileClick}
                                    className="w-full text-left px-4 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                                >
                                    <UserIcon className="h-5 w-5 mr-2" />
                                    Profile
                                </button>

                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                                >
                                    <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}