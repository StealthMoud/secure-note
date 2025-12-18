'use client';
import { useState, useEffect, useRef } from 'react';
import {
    UserIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    ArrowsUpDownIcon,
    ChartBarIcon,
    PlusIcon,
    CheckCircleIcon,
    XCircleIcon,
    XMarkIcon,
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

interface Notification {
    id: string;
    message: string;
    type: 'error' | 'success';
    isExiting?: boolean;
}

export default function UsersPage() {
    const [activeTab, setActiveTab] = useState('all-users');
    const [subTab, setSubTab] = useState<'users' | 'admins'>('users');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('username-asc');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const notificationTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

    // Generate unique ID for notifications
    const generateNotificationId = () => `${Date.now()}-${Math.random()}`;

    // Add notification
    const addNotification = (message: string, type: 'error' | 'success') => {
        const id = generateNotificationId();
        setNotifications(prev => [...prev, { id, message, type }]);

        // Auto-dismiss after 5 seconds
        const timeout = setTimeout(() => {
            dismissNotification(id);
        }, 5000);
        notificationTimeoutRef.current.set(id, timeout);
    };

    // Dismiss notification
    const dismissNotification = (id: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, isExiting: true } : n
        ));
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
            const timeout = notificationTimeoutRef.current.get(id);
            if (timeout) {
                clearTimeout(timeout);
                notificationTimeoutRef.current.delete(id);
            }
        }, 300);
    };

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            notificationTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
            notificationTimeoutRef.current.clear();
        };
    }, []);

    // Fetch users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found');
                }
                const response = await api.get<{ users: User[] }>('/admin/users', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsers(response.data.users);
            } catch (err: any) {
                const errorMessage = err.response?.data?.error || err.message || 'Failed to load users';
                console.error('Fetch users error:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status,
                    stack: err.stack,
                });
                addNotification(errorMessage, 'error');
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <svg
                    className="animate-spin h-8 w-8 text-blue-500 dark:text-blue-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
                <span className="ml-2 text-gray-700 dark:text-gray-300">Loading users...</span>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 animate-fadeInShort relative">
            <style jsx>{`
                @keyframes fadeInShort {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .animate-slideIn { animation: slideIn 0.3s ease-out; }
                .animate-slideOut { animation: slideOut 0.3s ease-in; }
            `}</style>

            {/* Notification Popups */}
            <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
                {notifications.map(notification => (
                    <div
                        key={notification.id}
                        className={`flex items-center p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
                            notification.type === 'error'
                                ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        } ${notification.isExiting ? 'animate-slideOut' : 'animate-slideIn'}`}
                    >
                        {notification.type === 'error' ? (
                            <XCircleIcon className="h-6 w-6 mr-2" />
                        ) : (
                            <CheckCircleIcon className="h-6 w-6 mr-2" />
                        )}
                        <p className="flex-1 text-sm">{notification.message}</p>
                        <button
                            onClick={() => dismissNotification(notification.id)}
                            className="ml-2 focus:outline-none"
                            aria-label="Dismiss notification"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                ))}
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center mb-6">
                <UserIcon className="w-8 h-8 mr-2 text-gray-700 dark:text-gray-300 animate-pulse" />
                Manage Users
            </h2>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    className={`px-4 py-2 ${activeTab === 'all-users' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
                    onClick={() => setActiveTab('all-users')}
                >
                    All Users
                </button>
                <button
                    className={`px-4 py-2 ${activeTab === 'pending-verifications' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
                    onClick={() => setActiveTab('pending-verifications')}
                >
                    Pending Verifications
                </button>
                <button
                    className={`px-4 py-2 ${activeTab === 'user-activity' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
                    onClick={() => setActiveTab('user-activity')}
                >
                    User Activity
                </button>
                <button
                    className={`px-4 py-2 ${activeTab === 'add-user' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
                    onClick={() => setActiveTab('add-user')}
                >
                    Add User/Admin
                </button>
            </div>

            {/* Sub-tabs for All Users */}
            {activeTab === 'all-users' && (
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                    <button
                        className={`px-4 py-2 ${subTab === 'users' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
                        onClick={() => setSubTab('users')}
                    >
                        Users
                    </button>
                    <button
                        className={`px-4 py-2 ${subTab === 'admins' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
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
                    addNotification={addNotification}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                    activeTab={activeTab}
                />
            )}
            {activeTab === 'user-activity' && <UserActivity users={users} addNotification={addNotification} />}
            {activeTab === 'add-user' && <AddUserForm setUsers={setUsers} addNotification={addNotification} />}
        </div>
    );
}

function UserList({
                      users,
                      setUsers,
                      addNotification,
                      searchTerm,
                      setSearchTerm,
                      sortOption,
                      setSortOption,
                      activeTab,
                  }: {
    users: User[];
    setUsers: (users: SetStateAction<User[]>) => void;
    addNotification: (message: string, type: 'error' | 'success') => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    sortOption: string;
    setSortOption: (option: string) => void;
    activeTab: string;
}) {
    const handleDelete = async (userId: string) => {
        const token = localStorage.getItem('token');
        if (!token) {
            addNotification('No authentication token found', 'error');
            return;
        }

        const currentUserId = parseJwt(token).id;

        if (userId === currentUserId) {
            addNotification('Admins cannot delete themselves', 'error');
            return;
        }

            try {
                await api.delete(`/admin/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsers(prev => prev.filter(u => u._id !== userId));
                addNotification('User deleted successfully', 'success');
            } catch (err: any) {
                const errorMessage = err.response?.data?.error || 'Failed to delete user';
                console.error('Delete user error:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status,
                    stack: err.stack,
                });
                addNotification(errorMessage, 'error');
            }
    };

    // Helper to decode JWT
    function parseJwt(token: string) {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return {};
        }
    }

    const handleApprove = async (userId: string) => {
        try {
            const data = await approveVerification(userId);
            addNotification(data.message, 'success');
            setUsers(prev => prev.filter(u => u._id !== userId));
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Failed to approve verification';
            console.error('Approve verification error:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                stack: err.stack,
            });
            addNotification(errorMessage, 'error');
        }
    };

    const handleReject = async (userId: string) => {
        try {
            const data = await rejectVerification(userId);
            addNotification(data.message, 'success');
            setUsers(prev => prev.filter(u => u._id !== userId));
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Failed to reject verification';
            console.error('Reject verification error:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                stack: err.stack,
            });
            addNotification(errorMessage, 'error');
        }
    };

    return (
        <div>
            <div className="flex items-center mb-4">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by username or email..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-slate-600 dark:focus:ring-slate-400 transition duration-200"
                    />
                </div>
                <div className="ml-4 flex items-center">
                    <ArrowsUpDownIcon className="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500" />
                    <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="p-2 border rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-slate-600 dark:focus:ring-slate-400 transition duration-200"
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
                    users.map((user, index) => (
                        <div
                            key={user._id}
                            className={`p-4 border-b dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-500 ease-in-out transform hover:scale-105 hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] animate-fadeInCard`}
                            style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                        >
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
                                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 flex items-center transition duration-200 transform hover:scale-105 active:scale-95"
                                        >
                                            <CheckCircleIcon className="w-5 h-5 mr-1" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(user._id)}
                                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center transition duration-200 transform hover:scale-105 active:scale-95"
                                        >
                                            <XCircleIcon className="w-5 h-5 mr-1" />
                                            Reject
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => handleDelete(user._id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center transition duration-200 transform hover:scale-105 active:scale-95"
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

function UserActivity({ users, addNotification }: { users: User[]; addNotification: (message: string, type: 'error' | 'success') => void }) {
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [activity, setActivity] = useState<Activity | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedUser) {
            setLoading(true);
            getUserActivity(selectedUser)
                .then((data) => {
                    setActivity(data);
                    addNotification('User activity loaded successfully', 'success');
                })
                .catch((err: any) => {
                    const errorMessage = err.response?.data?.error || 'Failed to load activity';
                    console.error('Fetch activity error:', {
                        message: err.message,
                        response: err.response?.data,
                        status: err.response?.status,
                        stack: err.stack,
                    });
                    addNotification(errorMessage, 'error');
                })
                .finally(() => setLoading(false));
        }
    }, [selectedUser, addNotification]);

    return (
        <div>
            <select
                onChange={(e) => setSelectedUser(e.target.value || null)}
                className="w-full p-2 mb-4 border rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-slate-600 dark:focus:ring-slate-400 transition duration-200"
            >
                <option value="">Select a user</option>
                {users.map((user) => (
                    <option key={user._id} value={user._id}>{user.username}</option>
                ))}
            </select>
            {loading && (
                <div className="flex items-center justify-center">
                    <svg
                        className="animate-spin h-8 w-8 text-blue-500 dark:text-blue-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Loading activity...</span>
                </div>
            )}
            {activity && (
                <div
                    className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-500 ease-in-out transform hover:scale-105 hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] animate-fadeInCard"
                >
                    <div className="flex items-center">
                        <ChartBarIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                        <div>
                            <p className="text-gray-900 dark:text-gray-100"><strong>Notes Created:</strong> {activity.notesCreated}</p>
                            <p className="text-gray-900 dark:text-gray-100"><strong>Friends Added:</strong> {activity.friendsAdded}</p>
                            <p className="text-gray-900 dark:text-gray-100"><strong>Shared With:</strong> {activity.sharedWith.join(', ') || 'None'}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function AddUserForm({
                         setUsers,
                         addNotification,
                     }: {
    setUsers: (users: SetStateAction<User[]>) => void;
    addNotification: (message: string, type: 'error' | 'success') => void;
}) {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'user' as 'user' | 'admin' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await createUser(formData);
            setUsers((prev: User[]) => [...prev, response.user]);
            addNotification('User created successfully', 'success');
            setFormData({ username: '', email: '', password: '', role: 'user' });
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Failed to create user';
            console.error('Create user error:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                stack: err.stack,
            });
            addNotification(errorMessage, 'error');
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
                    className="w-full p-2 border rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-slate-600 dark:focus:ring-slate-400 transition duration-200"
                    required
                />
            </div>
            <div>
                <label className="block text-gray-700 dark:text-gray-300">Email</label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-slate-600 dark:focus:ring-slate-400 transition duration-200"
                    required
                />
            </div>
            <div>
                <label className="block text-gray-700 dark:text-gray-300">Password</label>
                <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-slate-600 dark:focus:ring-slate-400 transition duration-200"
                    required
                />
            </div>
            <div>
                <label className="block text-gray-700 dark:text-gray-300">Role</label>
                <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'admin' })}
                    className="w-full p-2 border rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-slate-600 dark:focus:ring-slate-400 transition duration-200"
                >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
            <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center transition duration-200 transform hover:scale-105 active:scale-95"
            >
                <PlusIcon className="w-5 h-5 mr-1" />
                Add User
            </button>
        </form>
    );
}