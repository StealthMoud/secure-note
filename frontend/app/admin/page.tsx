'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useDashboardSharedContext } from '@/app/context/DashboardSharedContext';

export default function AdminLanding() {
    const { user, loading } = useDashboardSharedContext();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        console.log('AdminLanding useEffect - pathname:', pathname, 'user:', user, 'loading:', loading);
        if (!loading) {
            if (!user || user.role !== 'admin') {
                console.log('Redirecting non-admin to /');
                router.push('/');
            } else if (pathname === '/admin') {
                console.log('Redirecting /admin to /admin/overview');
                router.replace('/admin/overview');
            }
        }
    }, [user, loading, router, pathname]);

    if (loading) return <div className="text-center mt-10">Loading...</div>;
    if (!pathname.startsWith('/admin')) return null;

    // This won’t render anything since /admin redirects, but kept for clarity
    return <div>Redirecting to Admin Overview...</div>;
}