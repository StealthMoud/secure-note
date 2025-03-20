'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, approveVerification } from '@/services/auth';
import api from '@/services/api';

interface User {
    _id: string;
    username: string;
    email: string;
    role: string;
    verified?: boolean;
    verificationPending?: boolean;
}

export function useAdminVerifyLogic() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const router = useRouter();

    useEffect(() => {
        const fetchUsers = async () => {
            if (!router) return;
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }
            try {
                const userData = await getCurrentUser(token);
                if (userData.role !== 'admin') {
                    router.push('/');
                    return;
                }

                const response = await api.get<User[]>('/auth/users/pending', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('Pending users:', response.data); // Debug
                setUsers(Array.isArray(response.data) ? response.data : []);
            } catch (err: any) {
                console.error('Fetch users error:', err);
                setError(err.response?.data?.error || 'Failed to load pending verifications');
                setUsers([]); // Fallback to empty array
            }
            setLoading(false);
        };
        fetchUsers();
    }, [router]);

    const handleApprove = async (userId: string) => {
        try {
            const data = await approveVerification(userId);
            setMessage(data.message);
            setUsers(users.filter((u) => u._id !== userId));
        } catch (err: any) {
            setError(err.message);
        }
    };

    return {
        users,
        loading,
        message,
        error,
        handleApprove
    };
}