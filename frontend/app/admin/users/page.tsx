// /frontend/app/admin/users/page.tsx
'use client';
import { useState, useEffect } from 'react';
import {
    UserIcon,
    TrashIcon,
    LockClosedIcon,
    MagnifyingGlassIcon,
    ArrowsUpDownIcon,
    ChartBarIcon,
    PlusIcon,
    CheckCircleIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';
import api from '@/services/api';
import { createUser, unverifyUser, getUserActivity } from '@/services/adminService';
import { useDebounce } from '@/app/utils/debounce';
import { SetStateAction } from 'react';

interface User {
    _id: string;
    username: string;
    email: string;
    verified: boolean;
    isActive: boolean;
    createdAt: string;
}

interface Activity {
    notesCreated: number;
    friendsAdded: number;
    sharedWith: string[];
}

export default function UsersPage() {
    const [activeTab, setActiveTab] = useState('all-users');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('username-asc');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await api.get<{ users: User[] }>('/admin/users', {
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

    const filteredUsers = users
        .filter(user =>
            user.username.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortOption === 'username-asc') return a.username.localeCompare(b.username);
            if (sortOption === 'username-desc') return b.username.localeCompare(a.username);
            if (sortOption === 'created-asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (sortOption === 'created-desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            return 0;
        });

    if (loading) return <div className="text-center mt-10">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center mb-6">
                <UserIcon className="w-8 h-8 mr-2 text-gray-700 dark:text-gray-300" />
                Manage Users
            </h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    className={`px-4 py-2 ${activeTab === 'all-users' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('all-users')}
                >
                    All Users
                </button>
                <button
                    className={`px-4 py-2 ${activeTab === 'user-activity' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('user-activity')}
                >
                    User Activity
                </button>
                <button
                    className={`px-4 py-2 ${activeTab === 'add-user' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('add-user')}
                >
                    Add User/Admin
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'all-users' && (
                <UserList
                    users={filteredUsers}
                    setUsers={setUsers}
                    setError={setError}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                />
            )}
            {activeTab === 'user-activity' && <UserActivity users={users} setError={setError} />}
            {activeTab === 'add-user' && <AddUserForm setUsers={setUsers} setError={setError} />}
        </div>
    );
}

function UserList({
                      users,
                      setUsers,
                      setError,
                      searchTerm,
                      setSearchTerm,
                      sortOption,
                      setSortOption,
                  }: {
    users: User[];
    setUsers: (users: SetStateAction<User[]>) => void; // Updated type
    setError: (error: string) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    sortOption: string;
    setSortOption: (option: string) => void;
}) {
    const handleVerifyToggle = async (userId: string, isVerified: boolean) => {
        try {
            let updatedUser: User;
            if (isVerified) {
                // unverifyUser returns { message: string; user: User }
                const unverifyResponse = await unverifyUser(userId);
                updatedUser = unverifyResponse.user;
            } else {
                // api.put returns AxiosXHR<{ user: User }>
                const verifyResponse = await api.put<{ user: User }>(
                    `/admin/users/${userId}/verify`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    }
                );
                updatedUser = verifyResponse.data.user;
            }
            setUsers(prev => prev.map(u => (u._id === userId ? updatedUser : u)));
        } catch (err: any) {
            setError(err.response?.data?.error || `Failed to ${isVerified ? 'unverify' : 'verify'} user`);
        }
    };

    const handleDeactivate = async (userId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.put<{ user: User }>(`/admin/users/${userId}/deactivate`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(prev => prev.map(u => (u._id === userId ? response.data.user : u)));
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to deactivate user');
        }
    };

    const handleDelete = async (userId: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                const token = localStorage.getItem('token');
                await api.delete(`/admin/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsers(prev => prev.filter(u => u._id !== userId));
            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to delete user');
            }
        }
    };

    return (
        <div>
            <div className="flex items-center mb-4">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by username or email..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                    />
                </div>
                <div className="ml-4 flex items-center">
                    <ArrowsUpDownIcon className="w-5 h-5 mr-2 text-gray-400" />
                    <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="p-2 border rounded-lg dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                    >
                        <option value="username-asc">Username A-Z</option>
                        <option value="username-desc">Username Z-A</option>
                        <option value="created-asc">Created At Asc</option>
                        <option value="created-desc">Created At Desc</option>
                    </select>
                </div>
            </div>
            <div className="overflow-y-auto max-h-[500px] border border-gray-200 dark:border-gray-700 rounded-lg">
                {users.map((user) => (
                    <div key={user._id} className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                        <div>
                            <p className="text-gray-900 dark:text-gray-100"><strong>Username:</strong> {user.username}</p>
                            <p className="text-gray-600 dark:text-gray-300"><strong>Email:</strong> {user.email}</p>
                            <p className="text-gray-600 dark:text-gray-300"><strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                            <p className="text-gray-600 dark:text-gray-300"><strong>Verified:</strong> {user.verified ? 'Yes' : 'No'}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleVerifyToggle(user._id, user.verified)}
                                className={`${user.verified ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white px-3 py-1 rounded flex items-center`}
                            >
                                {user.verified ? <XCircleIcon className="w-5 h-5 mr-1" /> : <CheckCircleIcon className="w-5 h-5 mr-1" />}
                                {user.verified ? 'Unverify' : 'Verify'}
                            </button>
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
                    </div>
                ))}
            </div>
        </div>
    );
}

function UserActivity({ users, setError }: { users: User[]; setError: (error: string) => void }) {
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [activity, setActivity] = useState<Activity | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedUser) {
            setLoading(true);
            getUserActivity(selectedUser)
                .then((data) => setActivity(data))
                .catch((err: any) => setError(err.response?.data?.error || 'Failed to load activity'))
                .finally(() => setLoading(false));
        }
    }, [selectedUser, setError]);

    return (
        <div>
            <select
                onChange={(e) => setSelectedUser(e.target.value || null)}
                className="w-full p-2 mb-4 border rounded-lg dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            >
                <option value="">Select a user</option>
                {users.map((user) => (
                    <option key={user._id} value={user._id}>{user.username}</option>
                ))}
            </select>
            {loading && <p>Loading activity...</p>}
            {activity && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center">
                    <ChartBarIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                    <div>
                        <p><strong>Notes Created:</strong> {activity.notesCreated}</p>
                        <p><strong>Friends Added:</strong> {activity.friendsAdded}</p>
                        <p><strong>Shared With:</strong> {activity.sharedWith.join(', ') || 'None'}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

function AddUserForm({ setUsers, setError }: { setUsers: (users: SetStateAction<User[]>) => void; setError: (error: string) => void }) {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'user' as 'user' | 'admin' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await createUser(formData);
            setUsers((prev: User[]) => [...prev, response.user]);
            setFormData({ username: '', email: '', password: '', role: 'user' });
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create userrrrrr');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-gray-700 dark:text-gray-300">Username</label>
                <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                    required
                />
            </div>
            <div>
                <label className="block text-gray-700 dark:text-gray-300">Email</label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                    required
                />
            </div>
            <div>
                <label className="block text-gray-700 dark:text-gray-300">Password</label>
                <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                    required
                />
            </div>
            <div>
                <label className="block text-gray-700 dark:text-gray-300">Role</label>
                <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'admin' })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
            <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
            >
                <PlusIcon className="w-5 h-5 mr-1" />
                Add User
            </button>
        </form>
    );
}