'use client';
import { useState, useEffect } from 'react';
import { useDashboardSharedContext } from '@/context/DashboardSharedContext';
import { getFriends, respondToFriendRequest } from '@/services/users';
import { getNotes } from '@/services/notes';

interface User {
    _id: string;
    username: string;
}

interface FriendRequest {
    _id: string;
    sender: User;
    receiver: User;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
}

interface SharedWith {
    user: User;
    permission: 'viewer' | 'editor';
    encryptedContent?: string;
}

interface Note {
    _id: string;
    title: string;
    content: string;
    format: 'plain' | 'markdown';
    encrypted: boolean;
    owner: string | User;
    createdAt: string;
    sharedWith: SharedWith[];
}

export const useNotificationsLogic = () => {
    const { user, refreshNotifications, notificationsData } = useDashboardSharedContext();
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [sharedNotes, setSharedNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isExitingError, setIsExitingError] = useState(false);
    const [isExitingMessage, setIsExitingMessage] = useState(false);

    // Sync from context data
    useEffect(() => {
        if (notificationsData) {
            setFriendRequests(notificationsData.friendRequests);
            setSharedNotes(notificationsData.sharedNotes);
        }
    }, [notificationsData]);

    const dismissMessage = (type: 'error' | 'message') => {
        if (type === 'error') {
            setIsExitingError(true);
            setTimeout(() => {
                setError('');
                setIsExitingError(false);
            }, 500);
        } else {
            setIsExitingMessage(true);
            setTimeout(() => {
                setMessage('');
                setIsExitingMessage(false);
            }, 500);
        }
    };
    useEffect(() => {
        let errorTimeout: NodeJS.Timeout;
        let messageTimeout: NodeJS.Timeout;

        if (error) {
            errorTimeout = setTimeout(() => {
                setIsExitingError(true);
                setTimeout(() => {
                    setError('');
                    setIsExitingError(false);
                }, 500);
            }, 5000); // Display for 5 seconds
        }

        if (message) {
            messageTimeout = setTimeout(() => {
                setIsExitingMessage(true);
                setTimeout(() => {
                    setMessage('');
                    setIsExitingMessage(false);
                }, 500);
            }, 5000); // Display for 5 seconds
        }

        return () => {
            clearTimeout(errorTimeout);
            clearTimeout(messageTimeout);
        };
    }, [error, message]);

    const handleRespondToFriendRequest = async (requestId: string, action: 'accept' | 'reject') => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const data = await respondToFriendRequest(requestId, action);
            const friendsData = await getFriends();
            setFriendRequests(friendsData.friendRequests);
            setMessage(data.message || `Friend request ${action}ed successfully`);
            setIsExitingMessage(false);
            refreshNotifications();
        } catch (err: any) {
            setError(err.message || `Failed to ${action} friend request`);
            setIsExitingError(false);
        } finally {
            setLoading(false);
        }
    };

    return {
        friendRequests,
        sharedNotes,
        loading,
        message,
        error,
        isExitingError,
        isExitingMessage,
        dismissMessage,
        respondToFriendRequest: handleRespondToFriendRequest,
    };
};