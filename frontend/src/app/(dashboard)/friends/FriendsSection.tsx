import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useFriendsLogic } from '@/features/friends/hooks/useFriends';
import {
    UserPlusIcon,
    UsersIcon,
    EnvelopeIcon,
    CheckIcon,
    XMarkIcon,
    LockClosedIcon,
    CheckCircleIcon,
    XCircleIcon,
    SparklesIcon,
    HandRaisedIcon,
    UserCircleIcon,
} from '@heroicons/react/24/outline';

interface Friend {
    _id: string;
    username: string;
    email?: string;
}

interface FriendRequest {
    _id: string;
    sender: Friend;
    receiver: Friend;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
    updatedAt: string;
}

// empty state subcomponent
const EmptyState = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fadeInShort">
        <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-600 mb-6">
            <Icon className="w-16 h-16" />
        </div>
        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{title}</h3>
        <p className="text-gray-500 dark:text-slate-400 max-w-xs mt-2 font-medium">{description}</p>
    </div>
);

// user card subcomponent
const UserCard = ({ username, status, onAction, actionIcon: ActionIcon, actionLabel, actionColor }: any) => (
    <div className="glass p-4 rounded-2xl flex items-center justify-between group hover:scale-[1.02] transition-all hover:shadow-xl border border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-4">
            <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center font-bold text-gray-500 dark:text-gray-400">
                    {username[0].toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />
            </div>
            <div>
                <p className="font-black text-gray-900 dark:text-white">{username}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{status}</p>
            </div>
        </div>
        {onAction && (
            <button
                onClick={onAction}
                className={`p-2 rounded-xl border border-gray-100 dark:border-white/10 hover:bg-${actionColor}-500 hover:text-white transition-all active:scale-95 group-hover:shadow-lg`}
                title={actionLabel}
            >
                <ActionIcon className="w-5 h-5" />
            </button>
        )}
    </div>
);

export default function FriendsSection() {
    const router = useRouter();
    const {
        user,
        friends,
        friendRequests,
        friendRequestUsername,
        setFriendRequestUsername,
        handleSendFriendRequest,
        handleRespondToFriendRequest,
        message,
        error,
        isExitingError,
        isExitingMessage,
        dismissMessage,
        loading,
    } = useFriendsLogic();

    const [activeTab, setActiveTab] = useState<'all' | 'requests' | 'add'>('all');

    const incomingRequests = useMemo(() => friendRequests.filter(r => r.receiver._id === user?.user._id && r.status === 'pending'), [friendRequests, user]);
    const outgoingRequests = useMemo(() => friendRequests.filter(r => r.sender._id === user?.user._id && r.status === 'pending'), [friendRequests, user]);

    if (!user) return null;

    const tabs = [
        { id: 'all', label: 'Friends', icon: UsersIcon, count: friends.length },
        { id: 'requests', label: 'Requests', icon: EnvelopeIcon, count: incomingRequests.length },
        { id: 'add', label: 'Add Friend', icon: UserPlusIcon },
    ];

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-slide-up-fade">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        <UsersIcon className="w-10 h-10 text-blue-500" />
                        Friends
                    </h2>
                    <p className="text-gray-500 dark:text-slate-400 font-medium mt-1">Manage your friends and shared vault access.</p>
                </div>

                {!user.user.verified && (
                    <div className="glass px-4 py-2 rounded-2xl flex items-center gap-3 border-amber-500/20 bg-amber-500/5">
                        <LockClosedIcon className="w-5 h-5 text-amber-500" />
                        <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Verify Email to Add Friends</span>
                    </div>
                )}
            </header>

            {user.user.verified && (
                <div className="space-y-8">
                    {/* navigation tabs */}
                    <nav className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-2xl w-fit">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === tab.id
                                    ? 'bg-white dark:bg-gray-800 text-blue-500 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-white/10'}`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>

                    {/* content area */}
                    <main className="min-h-[400px]">
                        {activeTab === 'all' && (
                            <div className="animate-fadeInShort">
                                {friends.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {friends.map(friend => (
                                            <UserCard key={friend._id} username={friend.username} status="Trusted Contact" />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={UsersIcon}
                                        title="No Friends"
                                        description="You haven't added any friends yet. Add friends to share notes."
                                    />
                                )}
                            </div>
                        )}

                        {activeTab === 'requests' && (
                            <div className="space-y-8 animate-fadeInShort">
                                <section>
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 pl-1">Incoming ({incomingRequests.length})</h3>
                                    {incomingRequests.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-3">
                                            {incomingRequests.map(request => (
                                                <div key={request._id} className="glass p-4 rounded-2xl flex items-center justify-between border border-gray-100 dark:border-white/5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center font-bold text-blue-500">
                                                            {request.sender.username[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-gray-900 dark:text-white">{request.sender.username}</p>
                                                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none mt-1">Pending Approval</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleRespondToFriendRequest(request._id, 'accept')}
                                                            className="p-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all active:scale-90 shadow-lg shadow-emerald-500/20"
                                                        >
                                                            <CheckIcon className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRespondToFriendRequest(request._id, 'reject')}
                                                            className="p-2.5 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-all active:scale-90 shadow-lg shadow-rose-500/20"
                                                        >
                                                            <XMarkIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState icon={EnvelopeIcon} title="No New Requests" description="Your inbox is clear. Check back later for new connection requests." />
                                    )}
                                </section>

                                {outgoingRequests.length > 0 && (
                                    <section>
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 pl-1">Awaiting Response ({outgoingRequests.length})</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {outgoingRequests.map(request => (
                                                <UserCard key={request._id} username={request.receiver.username} status="Pending Acceptance" />
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>
                        )}

                        {activeTab === 'add' && (
                            <div className="max-w-xl mx-auto space-y-8 animate-fadeInShort">
                                <div className="glass-premium p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                                        <UserPlusIcon className="w-8 h-8 text-blue-500" />
                                        Add Friend
                                    </h3>
                                    <div className="relative group">
                                        <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            value={friendRequestUsername}
                                            onChange={(e) => setFriendRequestUsername(e.target.value)}
                                            placeholder="Enter username or email address..."
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white font-bold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSendFriendRequest}
                                        disabled={loading || !friendRequestUsername}
                                        className="w-full mt-4 py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                                    >
                                        {loading ? 'Sending...' : 'Send Request'}
                                    </button>

                                    {/* Floating Messages Area */}
                                    <div className="fixed top-24 right-4 z-50 flex flex-col gap-3 pointer-events-none">
                                        {error && (
                                            <div
                                                className={`pointer-events-auto bg-rose-500/10 backdrop-blur-md border border-rose-500/20 text-rose-600 dark:text-rose-400 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 transition-all duration-500 ${isExitingError ? 'opacity-0 translate-x-full' : 'animate-slide-in-right'}`}
                                                role="alert"
                                            >
                                                <XCircleIcon className="w-6 h-6 shrink-0" />
                                                <p className="font-bold">{error}</p>
                                                <button onClick={() => dismissMessage('error')} className="ml-4 hover:opacity-70 transition-opacity">
                                                    <XMarkIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                        {message && (
                                            <div
                                                className={`pointer-events-auto bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 transition-all duration-500 ${isExitingMessage ? 'opacity-0 translate-x-full' : 'animate-slide-in-right'}`}
                                                role="status"
                                            >
                                                <CheckCircleIcon className="w-6 h-6 shrink-0" />
                                                <p className="font-bold">{message}</p>
                                                <button onClick={() => dismissMessage('message')} className="ml-4 hover:opacity-70 transition-opacity">
                                                    <XMarkIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                </div>

                                <div className="text-center space-y-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <SparklesIcon className="w-4 h-4 text-blue-500" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Private by Design</span>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
                                        Note content is never visible to friends unless explicitly shared. SecureNote uses zero-knowledge sharing for ultimate privacy.
                                    </p>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            )}

            {!user.user.verified && (
                <div className="glass-premium p-12 rounded-[3rem] text-center max-w-2xl mx-auto shadow-2xl space-y-6">
                    <HandRaisedIcon className="w-16 h-16 mx-auto text-amber-500 animate-pulse" />
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Verification Required</h3>
                    <p className="text-gray-500 dark:text-slate-400 text-lg leading-relaxed">
                        To prevent spam and ensure the integrity of the network, social features are locked for unverified identities.
                    </p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-8 py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black hover:scale-105 transition-all active:scale-95 shadow-xl"
                    >
                        Return to Dashboard
                    </button>

                </div>
            )}
        </div>
    );
}