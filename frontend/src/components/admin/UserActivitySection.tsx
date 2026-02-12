'use client';
import { useState } from 'react';
import {
    CheckCircleIcon,
    GlobeAmericasIcon,
    ChartBarIcon,
    UserIcon,
    UsersIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { User } from '@/types/user';
import { useUserActivity } from '@/features/admin/hooks/useUserActivity';
import { AdminUserModals } from '@/components/admin/AdminUserModals';

interface UserActivitySectionProps {
    users: User[];
    addNotification: (msg: string, type: 'error' | 'success') => void;
    adminContext: any;
}

export const UserActivitySection = ({ users, addNotification, adminContext }: UserActivitySectionProps) => {
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [roleFilter, setRoleFilter] = useState<'user' | 'admin' | 'superadmin'>('user');
    const [showFriendsModal, setShowFriendsModal] = useState(false);

    const {
        activity,
        loading,
        error,
        showLogsModal,
        setShowLogsModal,
        logs,
        logsLoading,
        showBroadcastsModal,
        setShowBroadcastsModal,
        broadcasts,
        broadcastsLoading,
        handleShowLogs,
        handleShowBroadcasts
    } = useUserActivity(selectedUser, addNotification);

    const filteredUsers = users.filter(u => {
        if (u.role !== roleFilter) return false;
        // RBAC View check
        if (adminContext?.role === 'superadmin') return true;
        if (u.role === 'user') return true;
        return u._id === adminContext?.user._id;
    });

    const isAdminView = roleFilter !== 'user';
    const selectedUsername = users.find(u => u._id === selectedUser)?.username || '';

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
                            ? `No ${roleFilter === 'user' ? 'users' : 'admins'} found`
                            : `Choose ${roleFilter === 'user' ? 'a user' : 'an admin'} to view...`
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
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Loading activity...</span>
                </div>
            )}

            {!loading && !activity && !error && (
                <div className="glass p-12 rounded-[2rem] text-center border-dashed border-gray-200 dark:border-white/10 animate-fadeInShort">
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-blue-500/5 rounded-full">
                            <UserIcon className="w-8 h-8 text-blue-500/40" />
                        </div>
                        <div>
                            <p className="text-gray-400 font-bold italic">Select {roleFilter === 'user' ? 'a user' : 'an admin'} to view their activity history.</p>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-2 px-4 py-1.5 bg-gray-100 dark:bg-white/5 rounded-full inline-block">Awaiting Selection</p>
                        </div>
                    </div>
                </div>
            )}

            {activity && !loading && selectedUser && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeInShort">
                    {isAdminView ? (
                        <>
                            {/* admin view metrics */}
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
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Role</p>
                                <p className="text-xl font-black text-gray-900 dark:text-white mt-1 capitalize">
                                    {users.find(u => u._id === selectedUser)?.role || 'Admin'}
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* user view metrics */}
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
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Notes Created</p>
                                <p className="text-3xl font-black text-gray-900 dark:text-white">{activity.notesCreated}</p>
                            </div>

                            <div
                                onClick={() => setShowFriendsModal(true)}
                                className="group glass p-6 rounded-2xl border border-white/10 relative overflow-hidden transition-all hover:scale-[1.02] cursor-pointer hover:shadow-lg hover:shadow-purple-500/10"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <UsersIcon className="w-16 h-16 text-purple-500" />
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Friends</p>
                                    <span className="bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-[10px] px-1.5 py-0.5 rounded font-bold opacity-0 group-hover:opacity-100 transition-opacity">VIEW LIST</span>
                                </div>
                                <p className="text-3xl font-black text-gray-900 dark:text-white">{activity.friendsAdded || 0}</p>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* friends list modal */}
            {showFriendsModal && activity && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={() => setShowFriendsModal(false)}>
                    <div
                        className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/10 shadow-2xl w-full max-w-md max-h-[60vh] flex flex-col p-6 animate-scaleIn"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Friends List</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
                                    Friends of <span className="text-blue-500">@{selectedUsername}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => setShowFriendsModal(false)}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                            {activity.friendsList && activity.friendsList.length > 0 ? (
                                <div className="space-y-3">
                                    {activity.friendsList.map((friend, i) => (
                                        <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20">
                                                {friend[0].toUpperCase()}
                                            </div>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">@{friend}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <p className="text-sm font-medium">no friends added yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* logs and broadcast modals */}
            <AdminUserModals
                isOpen={showLogsModal || showBroadcastsModal}
                onClose={() => { setShowLogsModal(false); setShowBroadcastsModal(false); }}
                type={showLogsModal ? 'logs' : 'broadcasts'}
                data={showLogsModal ? logs : broadcasts}
                loading={showLogsModal ? logsLoading : broadcastsLoading}
                selectedUsername={selectedUsername}
            />
        </div>
    );
};
