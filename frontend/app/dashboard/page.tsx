'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardSharedContext } from '@/app/context/DashboardSharedContext';

export default function DashboardPage() {
    const { user, loading } = useDashboardSharedContext();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (user) {
                router.replace('/');
            } else {
                router.replace('/login');
            }
        }
    }, [user, loading, router]);

    if (loading) return <div className="text-center mt-10">Loading...</div>;

    return null; // Render nothing, handled by redirect
}