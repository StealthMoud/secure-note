import React from 'react';
import { UsersIcon } from '@heroicons/react/24/outline';
import { UserCard } from '@/components/friends/UserCard';
import { FriendsEmptyState } from './FriendsEmptyState';
// import { User } from '@/types/user';

interface Friend {
    _id: string;
    username: string;
    email?: string;
}

interface FriendsListProps {
    friends: Friend[];
}

export const FriendsList: React.FC<FriendsListProps> = ({ friends }) => {
    return (
        <div className="animate-fadeInShort">
            {friends.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {friends.map((friend) => (
                        <UserCard key={friend._id} username={friend.username} status="Trusted Contact" />
                    ))}
                </div>
            ) : (
                <FriendsEmptyState
                    icon={UsersIcon}
                    title="No Friends"
                    description="You haven't added any friends yet. Add friends to share notes."
                />
            )}
        </div>
    );
};
