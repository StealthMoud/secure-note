'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/services/auth';

interface Props {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            // check if user has valid token in localstorage
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }
            try {
                await getCurrentUser(token);
                setLoading(false);
            } catch (error) {
                // remove invalid token and redirect to login
                localStorage.removeItem('token');
                router.push('/login');
            }
        };
        checkAuth();
    }, [router]);

    if (loading) return <div className="text-center mt-10">Loading...</div>;

    return <>{children}</>;
}