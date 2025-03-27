// /app/notifications/notificationsLogic.ts
'use client';
import { useState, useEffect } from 'react';
import { useDashboardSharedContext } from '@/app/context/DashboardSharedContext';
import { getFriends, respondToFriendRequest } from '@/services/users';
import { getNotes } from '@/services/notes';

// Define interfaces (same as in NotificationsSection.tsx)
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
    const { user, refreshNotifications } = useDashboardSharedContext();
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [sharedNotes, setSharedNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const [friendsData, notesData] = await Promise.all([getFriends(), getNotes()]);
                setFriendRequests(friendsData.friendRequests);
                setSharedNotes(notesData.filter((note: Note) => note.sharedWith.length > 0));
                refreshNotifications(); // Update global count
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, [user, refreshNotifications]);

    const handleRespondToFriendRequest = async (requestId: string, action: 'accept' | 'reject') => {
        setLoading(true);
        try {
            await respondToFriendRequest(requestId, action);
            const friendsData = await getFriends();
            setFriendRequests(friendsData.friendRequests);
            refreshNotifications();
        } catch (error) {
            console.error('Failed to respond to friend request:', error);
        } finally {
            setLoading(false);
        }
    };

    return {
        friendRequests,
        sharedNotes,
        loading,
        respondToFriendRequest: handleRespondToFriendRequest,
    };
};