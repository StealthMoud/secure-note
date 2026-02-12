'use client';

import React from 'react';
import { UserPlusIcon, EnvelopeIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface AddFriendFormProps {
    friendRequestUsername: string;
    setFriendRequestUsername: (value: string) => void;
    handleSendFriendRequest: () => void;
    loading: boolean;
}

export const AddFriendForm: React.FC<AddFriendFormProps> = ({
    friendRequestUsername,
    setFriendRequestUsername,
    handleSendFriendRequest,
    loading
}) => {
    return (
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
    );
};
