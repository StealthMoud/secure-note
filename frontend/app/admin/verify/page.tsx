'use client';
import { useAdminVerifyLogic } from './useAdminVerifyLogic';

interface User {
    _id: string;
    username: string;
    email: string;
    role: string;
    verified?: boolean;
    verificationPending?: boolean;
}

export default function AdminVerifyPage() {
    const { users, loading, message, error, handleApprove } = useAdminVerifyLogic();

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