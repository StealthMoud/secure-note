'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardSharedProvider } from '@/app/context/DashboardSharedContext';
import DashboardContent from '../dashboard/DashboardContent';

export default function ProfilePage() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (pathname !== '/profile') {
            router.replace('/profile');
        }
    }, [router, pathname]);

    return (
        <DashboardSharedProvider>
            <DashboardContent defaultTab="profile" />
        </DashboardSharedProvider>
    );
}