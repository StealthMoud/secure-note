'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Updated for App Router
import { getCurrentUser } from '@/services/auth'; // Updated import

interface Props {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }
            try {
                await getCurrentUser(token); // Verify token
                setLoading(false);
            } catch (error) {
                localStorage.removeItem('token');
                router.push('/login');
            }
        };
        checkAuth();
    }, [router]);

    if (loading) return <div className="text-center mt-10">Loading...</div>;

    return <>{children}</>;
}