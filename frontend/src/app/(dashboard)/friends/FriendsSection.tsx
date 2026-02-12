'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useFriendsLogic } from '@/features/friends/hooks/useFriends';
import {
    UserPlusIcon,
    UsersIcon,
    EnvelopeIcon,
    LockClosedIcon,
    HandRaisedIcon,
} from '@heroicons/react/24/outline';
import { FeedbackToasts } from '@/components/ui';
import { AddFriendForm } from '@/components/friends/AddFriendForm';
import { FriendsList } from '@/features/friends/components/FriendsList';
import { FriendRequestsList } from '@/features/friends/components/FriendRequestsList';

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

    const dismissError = () => dismissMessage('error');
    const dismissFeedbackMessage = () => dismissMessage('message');

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-slide-up-fade">
            {/* unified feedback area */}
            <FeedbackToasts
                error={error}
                message={message}
                isExitingError={isExitingError}
                isExitingMessage={isExitingMessage}
                dismissError={dismissError}
                dismissMessage={dismissFeedbackMessage}
            />

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
                            <FriendsList friends={friends} />
                        )}

                        {activeTab === 'requests' && (
                            <FriendRequestsList
                                incomingRequests={incomingRequests}
                                outgoingRequests={outgoingRequests}
                                onRespond={handleRespondToFriendRequest}
                            />
                        )}

                        {activeTab === 'add' && (
                            <AddFriendForm
                                friendRequestUsername={friendRequestUsername}
                                setFriendRequestUsername={setFriendRequestUsername}
                                handleSendFriendRequest={handleSendFriendRequest}
                                loading={loading}
                            />
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