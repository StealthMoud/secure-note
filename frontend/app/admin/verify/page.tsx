'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, approveVerification } from '@/services/auth';
import api from '@/services/api'; // Axios instance

interface User {
    _id: string;
    username: string;
    email: string;
    role: string;
    verified?: boolean;
    verificationPending?: boolean;
}

export default function AdminVerifyPage() {
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
    }, []);

    const handleApprove = async (userId: string) => {
        try {
            const data = await approveVerification(userId);
            setMessage(data.message);
            setUsers(users.filter((u) => u._id !== userId));
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (loading) return <div className="text-center mt-10">Loading...</div>;

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-2xl font-bold mb-4">Admin - Verify Users</h1>
            {message && <p className="text-green-500 mb-4">{message}</p>}
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {users.length === 0 ? (
                <p>No pending verification requests.</p>
            ) : (
                <ul className="space-y-4">
                    {users.map((user) => (
                        <li key={user._id} className="border p-4 rounded flex justify-between items-center">
                            <div>
                                <p><strong>Username:</strong> {user.username}</p>
                                <p><strong>Email:</strong> {user.email}</p>
                            </div>
                            <button
                                onClick={() => handleApprove(user._id)}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                                Approve
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}