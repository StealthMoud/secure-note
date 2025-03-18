'use client';
import { useState, useEffect } from 'react';
import { getFriends, sendFriendRequest, respondToFriendRequest } from '@/services/users';
import { useDashboardSharedContext } from '@/app/context/DashboardSharedContext';

interface Friend {
    _id: string;
    username: string;
}

interface FriendRequest {
    _id: string;
    sender: { _id: string; username: string };
    receiver: { _id: string; username: string };
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
    updatedAt: string;
}

export const useFriendsLogic = () => {
    const { user } = useDashboardSharedContext();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [friendRequestUsername, setFriendRequestUsername] = useState('');
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false); // Added loading state

    useEffect(() => {
        const fetchFriends = async () => {
            if (!user) return;
            setLoading(true); // Start loading
            try {
                const friendsData = await getFriends();
                setFriends(friendsData.friends);
                setFriendRequests(friendsData.friendRequests);
                setError('');
            } catch (err: any) {
                setError(err.message || 'Failed to load friends');
            } finally {
                setLoading(false); // End loading
            }
        };
        fetchFriends();
    }, [user]);

    const handleSendFriendRequest = async () => {
        if (!friendRequestUsername.trim()) {
            setError('Username is required to send a friend request');
            return;
        }
        setLoading(true); // Start loading
        try {
            const data = await sendFriendRequest(friendRequestUsername);
            setFriendRequestUsername('');
            setMessage(data.message);
            setError('');
            const friendsData = await getFriends();
            setFriends(friendsData.friends);
            setFriendRequests(friendsData.friendRequests);
        } catch (err: any) {
            setError(err.message || 'Failed to send friend request');
        } finally {
            setLoading(false); // End loading
        }
    };

    const handleRespondToFriendRequest = async (requestId: string, action: 'accept' | 'reject') => {
        setLoading(true); // Start loading
        try {
            const data = await respondToFriendRequest(requestId, action);
            setMessage(data.message);
            setError('');
            const friendsData = await getFriends();
            setFriends(friendsData.friends);
            setFriendRequests(friendsData.friendRequests);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.message || 'Failed to respond to friend request';
            setError(errorMessage);
        } finally {
            setLoading(false); // End loading
        }
    };

    return {
        user,
        friends,
        friendRequests,
        friendRequestUsername,
        setFriendRequestUsername,
        handleSendFriendRequest,
        handleRespondToFriendRequest,
        message,
        error,
        loading, // Export loading state
    };
};