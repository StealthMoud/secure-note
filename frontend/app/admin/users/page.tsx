'use client';
import { useState, useEffect } from 'react';
import { UserIcon, TrashIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import api from '@/services/api';

// Define the User interface (consistent with your auth.ts)
interface User {
    _id: string;
    username: string;
    email: string;
    verified: boolean;
    isActive: boolean;
}

// Define the response type for the users API
interface UsersResponse {
    message: string;
    users: User[];
    total: number;
    pages: number;
    currentPage: number;
}

// Define the response type for user update/delete actions
interface UserActionResponse {
    message: string;
    user?: User; // Optional because delete doesn't return a user
}

export default function Page() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await api.get<UsersResponse>('/admin/users', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsers(response.data.users);
            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to load users');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleVerify = async (userId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.put<UserActionResponse>(`/admin/users/${userId}/verify`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(users.map((u) => (u._id === userId ? response.data.user! : u)));
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to verify user');
        }
    };

    const handleDeactivate = async (userId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.put<UserActionResponse>(`/admin/users/${userId}/deactivate`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(users.map((u) => (u._id === userId ? response.data.user! : u)));
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to deactivate user');
        }
    };

    const handleDelete = async (userId: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                const token = localStorage.getItem('token');
                await api.delete<UserActionResponse>(`/admin/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsers(users.filter((u) => u._id !== userId));
            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to delete user');
            }
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <UserIcon className="w-8 h-8 mr-2 text-gray-700 dark:text-gray-300" />
                Manage Users
            </h2>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            <ul className="space-y-4 mt-6">
                {users.map((user) => (
                    <li key={user._id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <div>
                            <p className="text-gray-900 dark:text-gray-100"><strong>Username:</strong> {user.username}</p>
                            <p className="text-gray-600 dark:text-gray-300"><strong>Email:</strong> {user.email}</p>
                            <p className="text-gray-600 dark:text-gray-300"><strong>Verified:</strong> {user.verified ? 'Yes' : 'No'}</p>
                            <p className="text-gray-600 dark:text-gray-300"><strong>Active:</strong> {user.isActive ? 'Yes' : 'No'}</p>
                        </div>
                        <div className="flex gap-2">
                            {!user.verified && (
                                <button
                                    onClick={() => handleVerify(user._id)}
                                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 flex items-center"
                                >
                                    Verify
                                </button>
                            )}
                            {user.isActive && (
                                <button
                                    onClick={() => handleDeactivate(user._id)}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 flex items-center"
                                >
                                    <LockClosedIcon className="w-5 h-5 mr-1" />
                                    Deactivate
                                </button>
                            )}
                            <button
                                onClick={() => handleDelete(user._id)}
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center"
                            >
                                <TrashIcon className="w-5 h-5 mr-1" />
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}