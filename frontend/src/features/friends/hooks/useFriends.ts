'use client';
import { useState, useEffect } from 'react';
import { getFriends, sendFriendRequest, respondToFriendRequest } from '@/services/users';
import { useDashboardSharedContext } from '@/context/DashboardSharedContext';

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

export const useFriendsLogic = () => {
    const { user } = useDashboardSharedContext();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [friendRequestUsername, setFriendRequestUsername] = useState('');
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [isExitingError, setIsExitingError] = useState(false);
    const [isExitingMessage, setIsExitingMessage] = useState(false);

    const dismissMessage = (type: 'error' | 'message') => {
        if (type === 'error') {
            setIsExitingError(true);
            setTimeout(() => {
                setError('');
                setIsExitingError(false);
            }, 500); // match transition duration
        } else {
            setIsExitingMessage(true);
            setTimeout(() => {
                setMessage('');
                setIsExitingMessage(false);
            }, 500); // Match transition duration
        }
    };

    useEffect(() => {
        const fetchFriends = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const friendsData = await getFriends();
                setFriends(friendsData.friends);
                setFriendRequests(friendsData.friendRequests);
                setError('');
            } catch (err: any) {
                setError(err.message || 'Failed to load friends');
            } finally {
                setLoading(false);
            }
        };
        fetchFriends();
    }, [user]);

    useEffect(() => {
        let errorTimeout: NodeJS.Timeout;
        let messageTimeout: NodeJS.Timeout;

        if (error) {
            errorTimeout = setTimeout(() => {
                setIsExitingError(true);
                setTimeout(() => {
                    setError('');
                    setIsExitingError(false);
                }, 500); // match transition duration
            }, 5000); // display for 5 seconds
        }

        if (message) {
            messageTimeout = setTimeout(() => {
                setIsExitingMessage(true);
                setTimeout(() => {
                    setMessage('');
                    setIsExitingMessage(false);
                }, 500); // match transition duration
            }, 5000); // display for 5 seconds
        }

        return () => {
            clearTimeout(errorTimeout);
            clearTimeout(messageTimeout);
        };
    }, [error, message]);

    const handleSendFriendRequest = async () => {
        if (!friendRequestUsername.trim()) {
            setError('Username or email is required to send a friend request');
            setIsExitingError(false);
            return;
        }

        if (!user) {
            setError('User not authenticated');
            setIsExitingError(false);
            return;
        }

        // check if friend request alredy exists to prevent duplicates
        const existingRequest = friendRequests.find(
            (r) =>
                r.sender._id === user.user._id &&
                (r.receiver.username === friendRequestUsername ||
                    (r.receiver.email && r.receiver.email === friendRequestUsername)) &&
                r.status === 'pending'
        );
        if (existingRequest) {
            setError('Friend request already sent to this user');
            setIsExitingError(false);
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');
        try {
            const data = await sendFriendRequest(friendRequestUsername);
            setFriendRequestUsername('');
            setMessage(data.message);
            setIsExitingMessage(false); // Reset exiting state for new message
            const friendsData = await getFriends();
            setFriends(friendsData.friends);
            setFriendRequests(friendsData.friendRequests);
        } catch (err: any) {
            setError(err.message || 'Failed to send friend request');
            setIsExitingError(false);
        } finally {
            setLoading(false);
        }
    };

    const handleRespondToFriendRequest = async (requestId: string, action: 'accept' | 'reject') => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const data = await respondToFriendRequest(requestId, action);
            setMessage(data.message);
            setIsExitingMessage(false); // Reset exiting state for new message
            const friendsData = await getFriends();
            setFriends(friendsData.friends);
            setFriendRequests(friendsData.friendRequests);
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.error || err.message || 'Failed to respond to friend request';
            setError(errorMessage);
            setIsExitingError(false);
        } finally {
            setLoading(false);
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
        isExitingError,
        isExitingMessage,
        dismissMessage,
        loading,
    };
};