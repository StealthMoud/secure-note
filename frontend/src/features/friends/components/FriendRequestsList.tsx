import React from 'react';
import { CheckIcon, XMarkIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { UserCard } from '@/components/friends/UserCard';
import { FriendsEmptyState } from './FriendsEmptyState';

// we need types for the request object structure
// assuming structure based on usage in FriendsSection.tsx
interface FriendRequest {
    _id: string;
    sender: {
        _id: string;
        username: string;
    };
    receiver: {
        _id: string;
        username: string;
    };
    status: 'pending' | 'accepted' | 'rejected';
}

interface FriendRequestsListProps {
    incomingRequests: FriendRequest[];
    outgoingRequests: FriendRequest[];
    onRespond: (requestId: string, action: 'accept' | 'reject') => void;
}

export const FriendRequestsList: React.FC<FriendRequestsListProps> = ({
    incomingRequests,
    outgoingRequests,
    onRespond,
}) => {
    return (
        <div className="space-y-8 animate-fadeInShort">
            <section>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 pl-1">
                    Incoming ({incomingRequests.length})
                </h3>
                {incomingRequests.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                        {incomingRequests.map((request) => (
                            <div
                                key={request._id}
                                className="glass p-4 rounded-2xl flex items-center justify-between border border-gray-100 dark:border-white/5"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center font-bold text-blue-500">
                                        {request.sender.username[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 dark:text-white">
                                            {request.sender.username}
                                        </p>
                                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none mt-1">
                                            Pending Approval
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onRespond(request._id, 'accept')}
                                        className="p-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all active:scale-90 shadow-lg shadow-emerald-500/20"
                                    >
                                        <CheckIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => onRespond(request._id, 'reject')}
                                        className="p-2.5 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-all active:scale-90 shadow-lg shadow-rose-500/20"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <FriendsEmptyState
                        icon={EnvelopeIcon}
                        title="No New Requests"
                        description="Your inbox is clear. Check back later for new connection requests."
                    />
                )}
            </section>

            {outgoingRequests.length > 0 && (
                <section>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 pl-1">
                        Awaiting Response ({outgoingRequests.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {outgoingRequests.map((request) => (
                            <UserCard
                                key={request._id}
                                username={request.receiver.username}
                                status="Pending Acceptance"
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};
