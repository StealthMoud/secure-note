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
    NoSymbolIcon,
    GlobeAmericasIcon
} from '@heroicons/react/24/outline';
import { useSearchParams } from 'next/navigation';
import api from '@/services/api';
import { createUser, getUserActivity, bulkUserAction, unverifyUser, verifyUser, updateUserRole, getSecurityLogs, getBroadcasts } from '@/services/adminService';
import { approveVerification, rejectVerification } from '@/services/auth';
import { useDebounce } from '@/lib/utils/debounce';
import { SetStateAction } from 'react';
import { useDashboardSharedContext } from '@/context/DashboardSharedContext';

interface User {
    _id: string;
    username: string;
    email: string;
    verified: boolean;
    createdAt: string;
    role: 'superadmin' | 'admin' | 'user';
    verificationPending: boolean;
}



interface Activity {
    notesCreated: number;
    friendsAdded: number;
    sharedWith: string[];
    adminActions?: number;
    broadcastsSent?: number;
}

interface Notification {
    id: string;
    message: string;
    type: 'error' | 'success';
    isExiting?: boolean;
}

const getRoleBadgeClass = (role: string) => {
    switch (role) {
        case 'superadmin':
            return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30';
        case 'admin':
            return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30';
        default:
            return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-white/10 dark:text-gray-300 dark:border-white/20';
    }
};

export default function UsersPage() {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState('all-users');
    const [subTab, setSubTab] = useState<'users' | 'admins'>('users');

    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam && ['all-users', 'pending-verifications', 'user-activity', 'add-user'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Clear selection when changing tabs
    useEffect(() => {
        setSelectedUserIds([]);
    }, [activeTab, subTab]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('username-asc');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const notificationTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

    // state for bulk actions
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

    // generate unique id for notifications
    const generateNotificationId = () => `${Date.now()}-${Math.random()}`;

    // add notification
    const addNotification = (message: string, type: 'error' | 'success') => {
        const id = generateNotificationId();
        setNotifications(prev => [...prev, { id, message, type }]);

        // auto dismiss after 5 seconds
        const timeout = setTimeout(() => {
            dismissNotification(id);
        }, 5000);
        notificationTimeoutRef.current.set(id, timeout);
    };

    // dismiss notification
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





    // cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            notificationTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
            notificationTimeoutRef.current.clear();
        };
    }, []);

    // fetch users
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
                if (subTab === 'users') return matchesSearch && user.role === 'user';
                return matchesSearch && ['admin', 'superadmin'].includes(user.role);
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

    const toggleUserSelection = (userId: string) => {
        setSelectedUserIds(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

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

            {/* notification popups */}
            <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
                {notifications.map(notification => (
                    <div
                        key={notification.id}
                        className={`flex items-center p-4 rounded-lg shadow-lg transform transition-all duration-300 ${notification.type === 'error'
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

            <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <UserIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">User Management</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Manage user accounts & verification</p>
                </div>
            </div>

            {/* tabs */}
            <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-xl mb-8">
                {['all-users', 'pending-verifications', 'user-activity', 'add-user'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === tab
                            ? 'bg-white dark:bg-white/10 text-blue-600 shadow-sm'
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                    >
                        {tab.replace('-', ' ')}
                    </button>
                ))}
            </div>

            {/* sub tabs for all users */}
            {activeTab === 'all-users' && (
                <div className="flex items-center gap-2 mb-6">
                    {['users', 'admins'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setSubTab(tab as any)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${subTab === tab
                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                                : 'bg-transparent text-gray-400 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            )}

            {/* tab content */}
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
                    selectedUserIds={selectedUserIds}
                    onToggleSelection={toggleUserSelection}
                    onClearSelection={() => setSelectedUserIds([])}
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
    selectedUserIds,
    onToggleSelection,
    onClearSelection,
}: {
    users: User[];
    setUsers: (users: SetStateAction<User[]>) => void;
    addNotification: (message: string, type: 'error' | 'success') => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    sortOption: string;
    setSortOption: (option: string) => void;
    activeTab: string;
    selectedUserIds: string[];
    onToggleSelection: (userId: string) => void;
    onClearSelection: () => void;
}) {
    const { user: adminContext } = useDashboardSharedContext();
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        action: () => Promise<void>;
        type: 'danger' | 'warning';
    }>({
        isOpen: false,
        title: '',
        message: '',
        action: async () => { },
        type: 'warning'
    });
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isBulkLoading, setIsBulkLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = JSON.parse(atob(token.split('.')[1]));
                setCurrentUserId(decoded.id);
            } catch (e) {
                console.error('Invalid token', e);
            }
        }
    }, []);

    const handleBulkAction = async (action: 'verify' | 'delete' | 'unverify') => {
        if (selectedUserIds.length === 0) return;

        // Filter valid targets based on action to avoid redundant requests
        let qualifiedIds = selectedUserIds;
        let actionLabel: string = action;

        if (action === 'verify') {
            qualifiedIds = selectedUserIds.filter(id => {
                const u = users.find(user => user._id === id);
                return u && u.role === 'user' && !u.verified;
            });
            if (qualifiedIds.length === 0) {
                addNotification('Selected users are already verified', 'error');
                return;
            }
            actionLabel = 'verify';
        } else if (action === 'unverify') {
            qualifiedIds = selectedUserIds.filter(id => {
                const u = users.find(user => user._id === id);
                return u && u.role === 'user' && u.verified;
            });
            if (qualifiedIds.length === 0) {
                addNotification('Selected users are already unverified', 'error');
                return;
            }
            actionLabel = 'revoke verification for';
        } else if (action === 'delete') {
            // Filter out self
            qualifiedIds = selectedUserIds.filter(id => id !== currentUserId);
            if (qualifiedIds.length === 0) {
                addNotification('Cannot delete yourself', 'error');
                return;
            }
        }

        setModalConfig({
            isOpen: true,
            title: action === 'delete' ? 'Delete Users' : `${action.charAt(0).toUpperCase() + action.slice(1)} Users`,
            message: `Are you sure you want to ${actionLabel} ${qualifiedIds.length} ${qualifiedIds.length === 1 ? 'user' : 'users'}?`,
            type: action === 'delete' || action === 'unverify' ? 'danger' : 'warning',
            action: async () => {
                setIsBulkLoading(true);
                try {
                    const data = await bulkUserAction(qualifiedIds, action);
                    addNotification(data.message, 'success');

                    if (action === 'delete') {
                        setUsers(prev => prev.filter(u => !qualifiedIds.includes(u._id)));
                        onClearSelection();
                    } else if (action === 'verify') {
                        setUsers(prev => prev.map(u => qualifiedIds.includes(u._id) ? { ...u, verified: true } : u));
                        onClearSelection();
                    } else if (action === 'unverify') {
                        setUsers(prev => prev.map(u => qualifiedIds.includes(u._id) ? { ...u, verified: false } : u));
                        onClearSelection();
                    }
                } catch (err: any) {
                    addNotification(err.message || 'Bulk action failed', 'error');
                } finally {
                    setIsBulkLoading(false);
                }
            }
        });
    };

    // ... handlers ...
    // decode jwt at top level of component
    const handleDelete = async (userId: string) => {
        const token = localStorage.getItem('token');
        if (!token) {
            addNotification('No authentication token found', 'error');
            return;
        }

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
            const errorMessage = err.message || 'Failed to delete user';
            console.error('Delete user error:', {
                message: errorMessage,
                fieldErrors: err.fieldErrors,
                originalResponse: err.response?.data,
                status: err.response?.status
            });
            addNotification(errorMessage, 'error');
        }
    };

    // helper to decode jwt
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
            const errorMessage = err.message || 'Failed to approve verification';
            console.error('Approve verification error:', {
                message: errorMessage,
                fieldErrors: err.fieldErrors,
                originalResponse: err.response?.data,
                status: err.response?.status
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
            const errorMessage = err.message || 'Failed to reject verification';
            console.error('Reject verification error:', {
                message: errorMessage,
                fieldErrors: err.fieldErrors,
                originalResponse: err.response?.data,
                status: err.response?.status
            });
            addNotification(errorMessage, 'error');
        }
    };

    const handleVerify = async (userId: string) => {
        try {
            await verifyUser(userId);
            addNotification('Verification email sent successfully', 'success');
            // Optimistic update might be misleading if it's just an email sent, 
            // but if verifyUser actually toggles the verified flag directly (which it seems to do based on previous code), 
            // then "User verified successfully" is technically correct but maybe the user wants to know about the email.
            // Let's check verifyUser service definition.
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, verified: true } : u));
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to verify user';
            console.error('Verify user error:', {
                message: errorMessage,
                fieldErrors: err.fieldErrors,
                originalResponse: err.response?.data,
                status: err.response?.status
            });
            addNotification(errorMessage, 'error');
        }
    };

    const handleUnverify = (userId: string) => {
        setModalConfig({
            isOpen: true,
            title: 'Revoke Verification',
            message: 'Are you sure you want to revoke verification for this user? They will need to re-verify their email address.',
            type: 'warning',
            action: async () => {
                try {
                    await unverifyUser(userId);
                    addNotification('User verification revoked', 'success');
                    setUsers(prev => prev.map(u => u._id === userId ? { ...u, verified: false } : u));
                } catch (err: any) {
                    const errorMessage = err.message || 'Failed to unverify user';
                    console.error('Unverify user error:', {
                        message: errorMessage,
                        fieldErrors: err.fieldErrors,
                        originalResponse: err.response?.data,
                        status: err.response?.status
                    });
                    addNotification(errorMessage, 'error');
                }
            }
        });
    };

    // handler for updating user roles (moved down)
    const handleRoleUpdate = async (userId: string, newRole: string) => {
        try {
            await updateUserRole(userId, newRole);
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole as any } : u));
            addNotification(`User role updated to ${newRole}`, 'success');
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to update role';
            console.error('Role update error:', {
                message: errorMessage,
                fieldErrors: err.fieldErrors,
                originalResponse: err.response?.data,
                status: err.response?.status
            });
            addNotification(errorMessage, 'error');
        }
    };

    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 group">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search user accounts..."
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm"
                    />
                </div>
                <button
                    onClick={() => setSortOption(sortOption === 'created-desc' ? 'created-asc' : 'created-desc')}
                    className="p-3.5 rounded-xl bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all text-gray-400 group"
                    title="Sort"
                >
                    <ArrowsUpDownIcon className="w-5 h-5" />
                </button>
            </div>

            {/* bulk action buttons component */}
            {selectedUserIds.length > 0 && (activeTab === 'all-users' || activeTab === 'pending-verifications') && (
                <div className="flex items-center justify-between gap-4 mb-6 p-4 bg-blue-50/50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/20 backdrop-blur-md animate-fadeInShort">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-bold">
                            {selectedUserIds.length}
                        </span>
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">users selected</span>
                    </div>
                    <div className="flex gap-2">
                        {(activeTab === 'all-users' && users.some(u => selectedUserIds.includes(u._id) && u.role === 'user' && !u.verified)) && (
                            <button
                                onClick={() => handleBulkAction('verify')}
                                disabled={isBulkLoading}
                                className="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-green-500/20 disabled:opacity-50"
                            >
                                Verify Selected
                            </button>
                        )}
                        {(activeTab === 'all-users' && users.some(u => selectedUserIds.includes(u._id) && u.role === 'user' && u.verified)) && (
                            <button
                                onClick={() => handleBulkAction('unverify')}
                                disabled={isBulkLoading}
                                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                            >
                                Unverify Selected
                            </button>
                        )}

                        {/* Specific actions for Pending Verifications tab */}
                        {activeTab === 'pending-verifications' && (
                            <>
                                <button
                                    onClick={() => handleBulkAction('verify')}
                                    disabled={isBulkLoading}
                                    className="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-green-500/20 disabled:opacity-50"
                                >
                                    Accept Selected
                                </button>
                                <button
                                    onClick={() => handleBulkAction('unverify')}
                                    disabled={isBulkLoading}
                                    className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                                >
                                    Reject Selected
                                </button>
                            </>
                        )}

                        {activeTab === 'all-users' && (
                            <button
                                onClick={() => handleBulkAction('delete')}
                                disabled={isBulkLoading}
                                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                            >
                                Delete Selected
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden bg-white/50 dark:bg-white/5 backdrop-blur-xl">
                <div className="overflow-y-auto max-h-[600px] custom-scrollbar">
                    {users.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-500 dark:text-gray-400 font-medium">No accounts found matching your criteria.</p>
                        </div>
                    ) : (
                        users.map((user, index) => (
                            <div
                                key={user._id}
                                className="group p-4 flex flex-col md:flex-row md:items-center gap-4 border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-blue-50/50 dark:hover:bg-white/5 transition-all duration-200"
                                style={{ animationDelay: `${0.05 * (index + 1)}s` }}
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <input
                                        type="checkbox"
                                        checked={selectedUserIds.includes(user._id)}
                                        onChange={() => onToggleSelection(user._id)}
                                        className="w-5 h-5 rounded border-gray-300 dark:border-white/20 text-blue-600 focus:ring-blue-500/20 bg-transparent transition-all cursor-pointer"
                                    />
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/10 dark:to-white/5 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-sm shadow-inner">
                                        {user.username.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">{user.username}</p>
                                            {adminContext?.role === 'superadmin' ? (
                                                <select
                                                    value={user.role}
                                                    disabled={user._id === adminContext?.user._id}
                                                    onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                                                    className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border transition-colors ${user._id === adminContext?.user._id ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} ${getRoleBadgeClass(user.role)}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    title={user._id === adminContext?.user._id ? 'You cannot change your own role' : ''}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                    <option value="superadmin">Super Admin</option>
                                                </select>
                                            ) : (
                                                user.role === 'user' ? (
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                                                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border transition-colors cursor-pointer ${getRoleBadgeClass(user.role)}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                ) : (
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${getRoleBadgeClass(user.role)}`}>
                                                        {user.role}
                                                    </span>
                                                )
                                            )}
                                            {user.verified && (
                                                <span className="px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 text-[10px] font-black uppercase tracking-wider border border-teal-200 dark:border-teal-500/30">
                                                    Verified
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium font-mono">{user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 justify-end shrink-0">
                                    <div className="w-24 text-right text-xs text-gray-400 font-mono hidden md:block shrink-0">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </div>

                                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity min-w-[140px] justify-end relative">
                                        {!['admin', 'superadmin'].includes(user.role) && (
                                            <>
                                                {user.verificationPending && (
                                                    <div className="flex gap-2 group/actions items-center absolute right-0 top-1/2 -translate-y-1/2">
                                                        <button
                                                            onClick={() => handleApprove(user._id)}
                                                            className="flex items-center px-2 py-1.5 rounded-lg text-green-600 bg-white dark:bg-gray-800 shadow-sm hover:bg-green-50 dark:hover:bg-green-500/10 transition-all group/btn border border-transparent hover:border-green-200 dark:hover:border-green-500/30"
                                                        >
                                                            <CheckCircleIcon className="w-5 h-5 shrink-0" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest max-w-0 opacity-0 group-hover/btn:max-w-[100px] group-hover/btn:opacity-100 group-hover/btn:ml-2 transition-all duration-300 overflow-hidden whitespace-nowrap">Approve</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(user._id)}
                                                            className="flex items-center px-2 py-1.5 rounded-lg text-red-600 bg-white dark:bg-gray-800 shadow-sm hover:bg-red-50 dark:hover:bg-red-500/10 transition-all group/btn border border-transparent hover:border-red-200 dark:hover:border-red-500/30"
                                                        >
                                                            <XCircleIcon className="w-5 h-5 shrink-0" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest max-w-0 opacity-0 group-hover/btn:max-w-[100px] group-hover/btn:opacity-100 group-hover/btn:ml-2 transition-all duration-300 overflow-hidden whitespace-nowrap">Reject</span>
                                                        </button>
                                                    </div>
                                                )}
                                                {!user.verified && !user.verificationPending && activeTab === 'all-users' && (
                                                    <div className="absolute right-0 top-1/2 -translate-y-1/2">
                                                        <button
                                                            onClick={() => handleVerify(user._id)}
                                                            className="flex items-center px-2 py-1.5 rounded-lg text-teal-600 bg-white dark:bg-gray-800 shadow-sm hover:bg-teal-50 dark:hover:bg-teal-500/10 transition-all group/btn border border-transparent hover:border-teal-200 dark:hover:border-teal-500/30"
                                                        >
                                                            <CheckCircleIcon className="w-5 h-5 shrink-0" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest max-w-0 opacity-0 group-hover/btn:max-w-[100px] group-hover/btn:opacity-100 group-hover/btn:ml-2 transition-all duration-300 overflow-hidden whitespace-nowrap">Verify</span>
                                                        </button>
                                                    </div>
                                                )}
                                                {user.verified && activeTab === 'all-users' && (
                                                    <div className="absolute right-0 top-1/2 -translate-y-1/2">
                                                        <button
                                                            onClick={() => handleUnverify(user._id)}
                                                            className="flex items-center px-2 py-1.5 rounded-lg text-amber-500 bg-white dark:bg-gray-800 shadow-sm hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all group/btn border border-transparent hover:border-amber-200 dark:hover:border-amber-500/30"
                                                        >
                                                            <NoSymbolIcon className="w-5 h-5 shrink-0" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest max-w-0 opacity-0 group-hover/btn:max-w-[100px] group-hover/btn:opacity-100 group-hover/btn:ml-2 transition-all duration-300 overflow-hidden whitespace-nowrap">Revoke</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {user._id !== currentUserId && (adminContext?.role === 'superadmin' || user.role === 'user') && (
                                            <div className={`transition-all duration-300 ${user.verificationPending || user.role !== 'admin' ? 'group-hover:mr-[140px]' : ''}`}>
                                                <button
                                                    onClick={() => handleDelete(user._id)}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors"
                                                    title="Delete User"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            {
                modalConfig.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xl max-w-sm w-full p-6 animate-scaleIn">
                            <h3 className={`text-lg font-bold mb-2 ${modalConfig.type === 'danger' ? 'text-red-500' : 'text-amber-500'}`}>
                                {modalConfig.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">
                                {modalConfig.message}
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                                    className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        await modalConfig.action();
                                        setModalConfig(prev => ({ ...prev, isOpen: false }));
                                    }}
                                    className={`px-4 py-2 rounded-xl text-white text-sm font-bold shadow-lg transition-all ${modalConfig.type === 'danger'
                                        ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                                        : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                                        }`}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}



function UserActivity({ users, addNotification }: { users: User[]; addNotification: (message: string, type: 'error' | 'success') => void }) {
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [activity, setActivity] = useState<Activity | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [roleFilter, setRoleFilter] = useState<'user' | 'admin' | 'superadmin'>('user');
    const { user: adminContext } = useDashboardSharedContext();

    // Logs modal state
    const [showLogsModal, setShowLogsModal] = useState(false);
    const [logs, setLogs] = useState<any[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);

    useEffect(() => {
        if (selectedUser) {
            setLoading(true);
            setError(null);
            setActivity(null);
            getUserActivity(selectedUser)
                .then((data) => {
                    setActivity(data);
                })
                .catch((err: any) => {
                    const errorMessage = err.response?.data?.error || 'Failed to load activity';
                    setError(errorMessage);
                })
                .finally(() => setLoading(false));
        }
    }, [selectedUser]);

    const handleShowLogs = async () => {
        if (!selectedUser) return;
        setShowLogsModal(true);
        setLogsLoading(true);
        try {
            const data = await getSecurityLogs({ userId: selectedUser, limit: 50 });
            setLogs(data.logs);
        } catch (err: any) {
            addNotification('Failed to load logs', 'error');
        } finally {
            setLogsLoading(false);
        }
    };

    // Broadcasts modal state
    const [showBroadcastsModal, setShowBroadcastsModal] = useState(false);
    const [broadcasts, setBroadcasts] = useState<any[]>([]);
    const [broadcastsLoading, setBroadcastsLoading] = useState(false);

    const handleShowBroadcasts = async () => {
        if (!selectedUser) return;
        setShowBroadcastsModal(true);
        setBroadcastsLoading(true);
        try {
            const data = await getBroadcasts(selectedUser);
            setBroadcasts(data.broadcasts);
        } catch (err: any) {
            addNotification('Failed to load broadcasts', 'error');
        } finally {
            setBroadcastsLoading(false);
        }
    };

    const filteredUsers = users.filter(u => {
        if (u.role !== roleFilter) return false;
        // RBAC View check: 
        // 1. Super admin sees everyone
        // 2. Admin sees users and themselves
        if (adminContext?.role === 'superadmin') return true;
        if (u.role === 'user') return true;
        return u._id === adminContext?.user._id;
    });
    const isAdminView = roleFilter !== 'user';

    return (
        <div className="space-y-8 animate-fadeInShort relative">
            <div className="glass p-6 rounded-2xl border border-white/10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Select Account</label>
                    <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
                        {(['user', 'admin', 'superadmin'] as const)
                            .filter(role => {
                                if (role === 'superadmin') return adminContext?.role === 'superadmin';
                                return true;
                            })
                            .map((role) => (
                                <button
                                    key={role}
                                    onClick={() => {
                                        setRoleFilter(role);
                                        setSelectedUser(null);
                                        setActivity(null);
                                    }}
                                    className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${roleFilter === role
                                        ? 'bg-white dark:bg-white/10 text-blue-600 shadow-sm'
                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                        }`}
                                >
                                    {role}
                                </button>
                            ))}
                    </div>
                </div>

                <select
                    value={selectedUser || ''}
                    onChange={(e) => setSelectedUser(e.target.value || null)}
                    className="w-full p-4 rounded-xl bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer font-medium"
                >
                    <option value="">
                        {filteredUsers.length === 0
                            ? `No ${roleFilter === 'user' ? 'standard nodes' : 'admins'} found`
                            : `Choose ${roleFilter === 'user' ? 'a user' : 'an admin'} to inspect...`
                        }
                    </option>
                    {filteredUsers.map((user) => (
                        <option key={user._id} value={user._id}>{user.username}</option>
                    ))}
                </select>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-50/50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-center animate-fadeInShort">
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Decrypting Activity Logs...</span>
                </div>
            )}

            {activity && !loading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeInShort">
                    {isAdminView ? (
                        <>
                            <div
                                onClick={handleShowLogs}
                                className="group glass p-6 rounded-2xl border border-white/10 relative overflow-hidden transition-all hover:scale-[1.02] cursor-pointer hover:shadow-lg hover:shadow-teal-500/10"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <CheckCircleIcon className="w-16 h-16 text-teal-500" />
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Security Logs</p>
                                    <span className="bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 text-[10px] px-1.5 py-0.5 rounded font-bold opacity-0 group-hover:opacity-100 transition-opacity">VIEW LOGS</span>
                                </div>
                                <p className="text-3xl font-black text-gray-900 dark:text-white">{activity.adminActions || 0}</p>
                            </div>

                            <div
                                onClick={handleShowBroadcasts}
                                className="group glass p-6 rounded-2xl border border-white/10 relative overflow-hidden transition-all hover:scale-[1.02] cursor-pointer hover:shadow-lg hover:shadow-blue-500/10"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <GlobeAmericasIcon className="w-16 h-16 text-blue-500" />
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Broadcasts Sent</p>
                                    <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] px-1.5 py-0.5 rounded font-bold opacity-0 group-hover:opacity-100 transition-opacity">VIEW HISTORY</span>
                                </div>
                                <p className="text-3xl font-black text-gray-900 dark:text-white">{activity.broadcastsSent || 0}</p>
                            </div>

                            <div className="group glass p-6 rounded-2xl border border-white/10 relative overflow-hidden transition-all hover:scale-[1.02]">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <UserIcon className="w-16 h-16 text-purple-500" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">System Role</p>
                                <p className="text-xl font-black text-gray-900 dark:text-white mt-1">Super User</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div
                                onClick={handleShowLogs}
                                className="group glass p-6 rounded-2xl border border-white/10 relative overflow-hidden transition-all hover:scale-[1.02] cursor-pointer hover:shadow-lg hover:shadow-teal-500/10"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <CheckCircleIcon className="w-16 h-16 text-teal-500" />
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Security Logs</p>
                                    <span className="bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 text-[10px] px-1.5 py-0.5 rounded font-bold opacity-0 group-hover:opacity-100 transition-opacity">VIEW LOGS</span>
                                </div>
                                <p className="text-3xl font-black text-gray-900 dark:text-white">{activity.adminActions || 0}</p>
                            </div>

                            <div className="group glass p-6 rounded-2xl border border-white/10 relative overflow-hidden transition-all hover:scale-[1.02]">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <ChartBarIcon className="w-16 h-16 text-blue-500" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Encrypted Assets</p>
                                <p className="text-3xl font-black text-gray-900 dark:text-white">{activity.notesCreated}</p>
                            </div>

                            <div className="group glass p-6 rounded-2xl border border-white/10 relative overflow-hidden transition-all hover:scale-[1.02]">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <GlobeAmericasIcon className="w-16 h-16 text-purple-500" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Shared Channels</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {activity.sharedWith.length > 0 ? (
                                        activity.sharedWith.map((user, i) => (
                                            <span key={i} className="px-2 py-1 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold">
                                                @{user}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm font-medium text-gray-400 italic">No external sharing</span>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Logs Modal */}
            {showLogsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={() => setShowLogsModal(false)}>
                    <div
                        className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/10 shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col p-6 animate-scaleIn"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Admin Activity Log</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
                                    History for <span className="text-blue-500">@{filteredUsers.find(u => u._id === selectedUser)?.username}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => setShowLogsModal(false)}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                            {logsLoading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Loading History...</span>
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <p className="text-sm font-medium">No activity recorded</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {logs.map((log: any) => (
                                        <div key={log._id} className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex gap-4">
                                            <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${log.severity === 'high' ? 'bg-red-500' :
                                                log.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                                                }`} />
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white capitalize">
                                                        {log.event.replace(/_/g, ' ')}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-gray-400">
                                                        {new Date(log.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-300 font-mono bg-white dark:bg-black/20 p-2 rounded-lg border border-gray-100 dark:border-white/5 overflow-x-auto">
                                                    {JSON.stringify(log.details, null, 2)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Broadcasts Modal */}
            {showBroadcastsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={() => setShowBroadcastsModal(false)}>
                    <div
                        className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/10 shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col p-6 animate-scaleIn"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Broadcast History</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
                                    Sent by <span className="text-blue-500">@{filteredUsers.find(u => u._id === selectedUser)?.username}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => setShowBroadcastsModal(false)}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                            {broadcastsLoading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Loading History...</span>
                                </div>
                            ) : broadcasts.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <p className="text-sm font-medium">No broadcasts sent</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {broadcasts.map((broadcast: any) => (
                                        <div key={broadcast._id} className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex gap-4">
                                            <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${broadcast.type === 'alert' ? 'bg-red-500' :
                                                broadcast.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                                                }`} />
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white capitalize">
                                                        {broadcast.type}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-gray-400">
                                                        {new Date(broadcast.createdAt).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium bg-white dark:bg-black/20 p-3 rounded-lg border border-gray-100 dark:border-white/5 mb-1">
                                                    {broadcast.message}
                                                </p>
                                                {broadcast.expiresAt && (
                                                    <p className="text-[10px] text-gray-400 italic text-right">
                                                        Expires: {new Date(broadcast.expiresAt).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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
            const errorMessage = err.message || 'Failed to create user';

            // more descriptive logging for debugging
            console.error('Create user error details:', {
                message: errorMessage,
                fieldErrors: err.fieldErrors,
                originalResponse: err.response?.data,
                status: err.response?.status
            });

            // use field errors for notification if available to tell if it's email or username
            const detailedError = err.fieldErrors
                ? Object.values(err.fieldErrors).join('. ')
                : errorMessage;

            addNotification(detailedError, 'error');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto glass p-8 rounded-[2rem] border border-white/10 shadow-2xl animate-fadeInShort">
            <div className="mb-8">
                <h3 className="text-xl font-black text-gray-900 dark:text-white">Add New User</h3>
                <p className="text-xs text-gray-500 font-medium">Create a new account for an admin or user.</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Username</label>
                    <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full p-4 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-bold"
                        placeholder="username"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-4 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-bold"
                        placeholder="email@secure.net"
                        required
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full p-4 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-bold"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'admin' })}
                            className="w-full p-4 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                className="w-full py-4 mt-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
                <PlusIcon className="w-5 h-5" />
                Create Account
            </button>
        </form>
    );
}