'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardSharedProvider } from '@/app/context/DashboardSharedContext';
import DashboardContent from '../dashboard/DashboardContent';

export default function NotesPage() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (pathname !== '/friends') {
            router.replace('/friends');
        }
    }, [router, pathname]);

    return (
        <DashboardSharedProvider>
            <DashboardContent defaultTab="friends" />
        </DashboardSharedProvider>
    );
}