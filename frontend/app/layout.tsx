'use client';
import '@/app/globals.css';
import {Inter} from 'next/font/google';
import Link from 'next/link';
import Head from 'next/head';
import {LockClosedIcon, MoonIcon, SunIcon, UserIcon} from '@heroicons/react/24/outline';
import {useDarkMode} from '@/lib/darkMode';
import {usePathname, useRouter} from 'next/navigation';
import {useEffect, useRef, useState} from 'react';
import {DashboardSharedProvider, useDashboardSharedContext} from '@/app/context/DashboardSharedContext';

const inter = Inter({subsets: ['latin']});

export default function RootLayout({children}: { children: React.ReactNode }) {
    const {isDarkMode, toggleDarkMode} = useDarkMode();
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
            <link rel="icon" href="/frontend/public/favicon.ico?v=1"/>
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

            <div className="w-full px-32"> {/* adding padding to middle container */}
                {!isHomePage && !isDashboardRoute && mounted && (
                    <div className="flex justify-center mb-10 mt-10">
                        <Link href="/">
                            <button className="flex items-center gap-3 px-4 py-2 bg-transparent border-none cursor-pointer text-gray-900 dark:text-gray-100 text-4xl font-bold">
                                <LockClosedIcon className="h-10 w-10 text-gray-400" />
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
    const {user, handleLogout} = useDashboardSharedContext();
    const router = useRouter();

    const handleProfileClick = () => {
        setShowProfileDropdown(false);
        router.push('/profile');
    };

    return (
        <div className="absolute top-6 right-6 flex gap-2 z-10">
            <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200"
            >
                {isDarkMode ? <SunIcon className="h-6 w-6"/> : <MoonIcon className="h-6 w-6"/>}
            </button>
            {user && (
                <div className="relative">
                    <button
                        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200"
                    >
                        <UserIcon className="h-6 w-6"/>
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