'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardSharedProvider } from '@/app/context/DashboardSharedContext';
import DashboardContent from '../dashboard/DashboardContent';

export default function NotificationsPage() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (pathname !== '/notifications') {
            router.replace('/notifications');
        }
    }, [router, pathname]);

    return (
        <DashboardSharedProvider>
            <DashboardContent defaultTab="notifications" />
        </DashboardSharedProvider>
    );
}