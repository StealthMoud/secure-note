'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useDashboardSharedContext } from '@/context/DashboardSharedContext';

export default function AdminLanding() {
    const { user, loading } = useDashboardSharedContext();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
                router.push('/');
            } else if (pathname === '/admin') {
                router.replace('/admin/overview');
            }
        }
    }, [user, loading, router, pathname]);

    if (loading) return <div className="text-center mt-10">Loading...</div>;
    if (!pathname.startsWith('/admin')) return null;

    // this wont render anything since /admin redirects but kept for clarity
    return <div>Redirecting to Admin Overview...</div>;
}