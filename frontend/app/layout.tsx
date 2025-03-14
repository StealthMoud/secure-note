'use client';
import '@/app/globals.css';
import { Inter } from 'next/font/google';
import { LockClosedIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useDarkMode } from '@/lib/darkMode';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    const pathname = usePathname();
    const isHomePage = pathname === '/';
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} bg-gray-100 dark:bg-gray-800 min-h-screen`}>
        <main className={`relative p-8 ${isHomePage ? 'flex items-center justify-center min-h-screen' : ''}`}>
            <button
                onClick={toggleDarkMode}
                className="absolute top-6 right-6 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200 z-10"
            >
                {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
            </button>

            <div className="max-w-4xl mx-auto">
                {!isHomePage && mounted && (
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
        </body>
        </html>
    );
}
