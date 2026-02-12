'use client';
import './globals.css';
import { Inter } from 'next/font/google';
import Head from 'next/head';
import { useDarkMode } from '@/hooks/useDarkMode';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { DashboardSharedProvider } from '@/context/DashboardSharedContext';
import { MainContent } from '@/components/layout/MainContent';

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

    return (
        <html lang="en" suppressHydrationWarning>
            <Head>
                <link rel="icon" href="/frontend/public/favicon.ico?v=1" />
            </Head>
            <body className={`${inter.className} min-h-screen`} suppressHydrationWarning>
                <DashboardSharedProvider>
                    <MainContent
                        pathname={pathname}
                        mounted={mounted}
                        isDarkMode={isDarkMode}
                        toggleDarkMode={toggleDarkMode}
                        showProfileDropdown={showProfileDropdown}
                        setShowProfileDropdown={setShowProfileDropdown}
                        dropdownRef={dropdownRef}
                    >
                        {children}
                    </MainContent>
                </DashboardSharedProvider>
            </body>
        </html>
    );
}