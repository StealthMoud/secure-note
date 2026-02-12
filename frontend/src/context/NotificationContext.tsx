'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { getFriends } from '@/services/users';
import { getNotes } from '@/services/notes';
import api from '@/services/api';

// broadcast shape from the api
interface Broadcast {
    _id: string;
    message: string;
    type: 'info' | 'warning' | 'alert';
    createdAt: string;
}

// friend request shape from the api
interface FriendRequestNotification {
    _id: string;
    sender: { _id: string; username: string };
    receiver: { _id: string; username: string };
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
}

// shared note shape from the api
interface SharedNoteNotification {
    _id: string;
    title: string;
    owner: { _id: string; username: string } | string;
    createdAt?: string;
}

// user data shape passed into the provider
interface UserData {
    user: {
        _id: string;
        username: string;
        role: string;
        verified?: boolean;
    };
    role: string;
}

interface NotificationsData {
    friendRequests: FriendRequestNotification[];
    sharedNotes: SharedNoteNotification[];
    broadcasts: Broadcast[];
}

interface NotificationContextType {
    notificationCount: number;
    refreshNotifications: () => void;
    markAsOpened: (id: string) => void;
    openedNotificationIds: string[];
    noteCount: number;
    friendsCount: number;
    activeBroadcast: Broadcast | null;
    notificationsData: NotificationsData;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children, user }: { children: ReactNode, user: UserData | null }) => {
    const [notificationCount, setNotificationCount] = useState(0);
    const [openedNotificationIds, setOpenedNotificationIds] = useState<string[]>([]);
    const [notificationsData, setNotificationsData] = useState<NotificationsData>({
        friendRequests: [],
        sharedNotes: [],
        broadcasts: [],
    });
    const [noteCount, setNoteCount] = useState(0);
    const [friendsCount, setFriendsCount] = useState(0);
    const [activeBroadcast, setActiveBroadcast] = useState<Broadcast | null>(null);

    const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastFetchRef = useRef<number>(0);
    const pendingFetchRef = useRef<Promise<void> | null>(null);

    const fetchNotifications = useCallback(async (force = false): Promise<void> => {
        if (!user) return;

        // request deduplication
        if (pendingFetchRef.current) return pendingFetchRef.current;

        const now = Date.now();
        const timeSinceLastFetch = now - lastFetchRef.current;

        if (!force && timeSinceLastFetch < 2500) {
            if (fetchTimeoutRef.current) return;
            fetchTimeoutRef.current = setTimeout(() => {
                fetchTimeoutRef.current = null;
                fetchNotifications(true);
            }, 3000 - timeSinceLastFetch);
            return;
        }

        if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current);
            fetchTimeoutRef.current = null;
        }

        lastFetchRef.current = now;

        pendingFetchRef.current = (async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const [friendsData, notesData, broadcastFeedResponse, activeBroadcastResponse] = await Promise.all([
                    getFriends(),
                    getNotes(),
                    api.get('/users/broadcast/feed', { headers: { Authorization: `Bearer ${token}` } }),
                    api.get('/users/broadcast', { headers: { Authorization: `Bearer ${token}` } })
                ]);

                const openedIds: string[] = JSON.parse(localStorage.getItem('openedNotifications') || '[]');
                setOpenedNotificationIds(openedIds);

                const currentFriendRequests = friendsData.friendRequests.filter(
                    (r: FriendRequestNotification) => r.receiver._id === user.user._id && r.status === 'pending'
                );

                const currentSharedNotes = notesData.filter(
                    (note: SharedNoteNotification) => typeof note.owner !== 'string' && note.owner._id !== user.user._id
                );

                const feedData = broadcastFeedResponse.data as { broadcasts?: Broadcast[] };
                const broadcastData = activeBroadcastResponse.data as { broadcast?: Broadcast };

                const currentBroadcasts = feedData.broadcasts || [];
                const primaryBroadcast = broadcastData.broadcast || null;

                setNotificationsData({
                    friendRequests: currentFriendRequests,
                    sharedNotes: currentSharedNotes,
                    broadcasts: currentBroadcasts
                });
                setActiveBroadcast(primaryBroadcast);

                const unreadRequests = currentFriendRequests.filter((r: FriendRequestNotification) => !openedIds.includes(r._id)).length;
                const unreadShared = currentSharedNotes.filter((n: SharedNoteNotification) => !openedIds.includes(n._id)).length;

                const dismissedId = localStorage.getItem('dismissedBroadcastId');
                const unreadBroadcasts = currentBroadcasts.filter(
                    (b: Broadcast) => b._id !== dismissedId && !openedIds.includes(b._id)
                ).length;

                setNotificationCount(unreadRequests + unreadShared + unreadBroadcasts);
                setNoteCount(notesData.length);
                setFriendsCount(friendsData.friends.length);
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            } finally {
                pendingFetchRef.current = null;
            }
        })();

        return pendingFetchRef.current;
    }, [user]);

    const markAsOpened = (id: string) => {
        const openedIds: string[] = JSON.parse(localStorage.getItem('openedNotifications') || '[]');
        if (!openedIds.includes(id)) {
            const newOpened = [...openedIds, id || ''];
            localStorage.setItem('openedNotifications', JSON.stringify(newOpened));
            setOpenedNotificationIds(newOpened);
            fetchNotifications();
        }
    };

    const refreshNotifications = useCallback(() => {
        fetchNotifications(true);
    }, [fetchNotifications]);

    // poll for notifications when user logged in
    useEffect(() => {
        if (user) {
            refreshNotifications();
            const interval = setInterval(() => {
                fetchNotifications();
            }, 60000); // refresh every minute
            return () => clearInterval(interval);
        }
    }, [user, refreshNotifications, fetchNotifications]);

    return (
        <NotificationContext.Provider
            value={{
                notificationCount,
                refreshNotifications,
                markAsOpened,
                openedNotificationIds,
                noteCount,
                friendsCount,
                notificationsData,
                activeBroadcast
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotificationContext must be used within a NotificationProvider');
    }
    return context;
};
