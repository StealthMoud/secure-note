'use client';
import { useState, useEffect } from 'react';
import {
    UserIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    ArrowsUpDownIcon,
    ChartBarIcon,
    PlusIcon,
    CheckCircleIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';
import api from '@/services/api';
import { createUser, getUserActivity } from '@/services/adminService';
import { approveVerification, rejectVerification } from '@/services/auth';
import { useDebounce } from '@/app/utils/debounce';
import { SetStateAction } from 'react';

interface User {
    _id: string;
    username: string;
    email: string;
    verified: boolean;
    isActive: boolean;
    createdAt: string;
    role: 'user' | 'admin';
    verificationPending: boolean;
}

interface Activity {
    notesCreated: number;
    friendsAdded: number;
    sharedWith: string[];
}

export default function UsersPage() {
    const [activeTab, setActiveTab] = useState('all-users');
    const [subTab, setSubTab] = useState<'users' | 'admins'>('users');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
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
        .filter(user => {
            const matchesSearch =
                user.username.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            if (activeTab === 'pending-verifications') {
                return matchesSearch && user.verificationPending;
            }
            if (activeTab === 'all-users') {
                return matchesSearch && user.role === (subTab === 'users' ? 'user' : 'admin');
            }
            return matchesSearch;
        })
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
            {message && <p className="text-green-500 mb-4">{message}</p>}
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
                    className={`px-4 py-2 ${activeTab === 'pending-verifications' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('pending-verifications')}
                >
                    Pending Verifications
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

            {/* Sub-tabs for All Users */}
            {activeTab === 'all-users' && (
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                    <button
                        className={`px-4 py-2 ${subTab === 'users' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                        onClick={() => setSubTab('users')}
                    >
                        Users
                    </button>
                    <button
                        className={`px-4 py-2 ${subTab === 'admins' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                        onClick={() => setSubTab('admins')}
                    >
                        Admins
                    </button>
                </div>
            )}

            {/* Tab Content */}
            {(activeTab === 'all-users' || activeTab === 'pending-verifications') && (
                <UserList
                    users={filteredUsers}
                    setUsers={setUsers}
                    setError={setError}
                    setMessage={setMessage}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                    activeTab={activeTab}
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
                      setMessage,
                      searchTerm,
                      setSearchTerm,
                      sortOption,
                      setSortOption,
                      activeTab,
                  }: {
    users: User[];
    setUsers: (users: SetStateAction<User[]>) => void;
    setError: (error: string) => void;
    setMessage: (message: string) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    sortOption: string;
    setSortOption: (option: string) => void;
    activeTab: string;
}) {
    const handleDelete = async (userId: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                const token = localStorage.getItem('token');
                await api.delete(`/admin/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsers(prev => prev.filter(u => u._id !== userId));
                setMessage('User deleted successfully');
            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to delete user');
            }
        }
    };

    const handleApprove = async (userId: string) => {
        try {
            const data = await approveVerification(userId);
            setMessage(data.message);
            setUsers(prev => prev.filter(u => u._id !== userId));
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to approve verification');
        }
    };

    const handleReject = async (userId: string) => {
        try {
            const data = await rejectVerification(userId);
            setMessage(data.message);
            setUsers(prev => prev.filter(u => u._id !== userId));
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to reject verification');
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
                {users.length === 0 ? (
                    <p className="p-4 text-gray-600 dark:text-gray-300">No users found.</p>
                ) : (
                    users.map((user) => (
                        <div key={user._id} className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                            <div>
                                <p className="text-gray-900 dark:text-gray-100"><strong>Username:</strong> {user.username}</p>
                                <p className="text-gray-600 dark:text-gray-300"><strong>Email:</strong> {user.email}</p>
                                <p className="text-gray-600 dark:text-gray-300"><strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                                <p className="text-gray-600 dark:text-gray-300"><strong>Verified:</strong> {user.verified ? 'Yes' : 'No'}</p>
                                <p className="text-gray-600 dark:text-gray-300"><strong>Role:</strong> {user.role}</p>
                                <p className="text-gray-600 dark:text-gray-300"><strong>Verification Pending:</strong> {user.verificationPending ? 'Yes' : 'No'}</p>
                            </div>
                            <div className="flex gap-2">
                                {activeTab === 'pending-verifications' && (
                                    <>
                                        <button
                                            onClick={() => handleApprove(user._id)}
                                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 flex items-center"
                                        >
                                            <CheckCircleIcon className="w-5 h-5 mr-1" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(user._id)}
                                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center"
                                        >
                                            <XCircleIcon className="w-5 h-5 mr-1" />
                                            Reject
                                        </button>
                                    </>
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
                    ))
                )}
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
            setError(err.response?.data?.error || 'Failed to create user');
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