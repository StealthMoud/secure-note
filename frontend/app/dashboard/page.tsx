'use client';
import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getCurrentUser, requestVerification } from '@/services/auth';


interface UserData {
    user: {
        _id: string;
        username: string;
        email: string;
        role: string;
        verified?: boolean;
    };
    role: string;
}

export default function DashboardPage() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const data = await getCurrentUser(token);
                    setUser(data);
                } catch (error) {
                    console.error('Failed to fetch user:', error);
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const handleRequestVerification = async () => {
        try {
            const data = await requestVerification();
            setMessage(data.message); // Show success message
        } catch (err: any) {
            setError(err.message); // Show error if fails
        }
    };

    if (loading) return <div className="text-center mt-10">Loading...</div>;

    return (
        <ProtectedRoute>
            <div className="container mx-auto p-4 max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
                {user ? (
                    <>
                        <p className="mb-4">Welcome, {user.user.username}!</p>
                        {user.user.verified ? (
                            <>
                                {user.role === 'admin' && <p className="mb-4">You’re an Admin—manage away!</p>}
                                {user.role === 'user' && (
                                    <div className="border p-4 rounded">
                                        <h2 className="text-xl font-semibold mb-2">Your Notes</h2>
                                        <p className="text-gray-500">Notes feature coming soon!</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="border p-4 rounded bg-yellow-100">
                                <p className="mb-2 text-yellow-800">Your email is not verified. Limited access only.</p>
                                <button
                                    onClick={handleRequestVerification}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Request Verification
                                </button>
                                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                                {message && <p className="text-green-500 text-sm mt-2">{message}</p>}
                            </div>
                        )}
                    </>
                ) : (
                    <p>Unable to load user data.</p>
                )}
            </div>
        </ProtectedRoute>
    );
}