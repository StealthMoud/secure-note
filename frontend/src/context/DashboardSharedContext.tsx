'use client';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser } from '@/services/auth';
import { User } from '@/services/auth';
import { getFriends } from '@/services/users';
import { getNotes } from '@/services/notes';
import api from '@/services/api';
import { useRef } from 'react';

interface UserData {
    user: User;
    role: 'superadmin' | 'admin' | 'user';
}

interface DashboardSharedContextType {
    user: UserData | null;
    loading: boolean;
    handleLogout: () => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    setUser: (user: UserData | null) => void;
    notificationCount: number;
    refreshNotifications: () => void;
    markAsOpened: (id: string) => void;
    openedNotificationIds: string[];
    noteCount: number;
    friendsCount: number;
    activeBroadcast: { _id: string; message: string; type: 'info' | 'warning' | 'alert' } | null;
    notificationsData: {
        friendRequests: any[];
        sharedNotes: any[];
        broadcasts: any[];
    };
}

const DashboardSharedContext = createContext<DashboardSharedContextType | undefined>(undefined);

export const DashboardSharedProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [notificationCount, setNotificationCount] = useState(0);
    const [openedNotificationIds, setOpenedNotificationIds] = useState<string[]>([]);
    const [notificationsData, setNotificationsData] = useState<{
        friendRequests: any[];
        sharedNotes: any[];
        broadcasts: any[];
    }>({ friendRequests: [], sharedNotes: [], broadcasts: [] });
    const [noteCount, setNoteCount] = useState(0);
    const [friendsCount, setFriendsCount] = useState(0);
    const [activeBroadcast, setActiveBroadcast] = useState<{ _id: string; message: string; type: 'info' | 'warning' | 'alert' } | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastFetchRef = useRef<number>(0);
    const pendingFetchRef = useRef<Promise<void> | null>(null);
    const initialLoadDone = useRef<boolean>(false);

    // define public routes that dont require authentication
    const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

    const fetchNotifications = useCallback(async (currentUser?: UserData, force = false): Promise<void> => {
        // Only block background fetches on actual public functional routes (not the landing/dashboard page)
        const blockRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
        if (blockRoutes.includes(pathname)) return;

        const activeUser = currentUser || user;
        if (!activeUser) return;

        // request deduplication
        if (pendingFetchRef.current) return pendingFetchRef.current;

        const now = Date.now();
        const timeSinceLastFetch = now - lastFetchRef.current;

        if (!force && timeSinceLastFetch < 2500) {
            if (fetchTimeoutRef.current) return;
            fetchTimeoutRef.current = setTimeout(() => {
                fetchTimeoutRef.current = null;
                fetchNotifications(activeUser, true);
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

                const openedIds = JSON.parse(localStorage.getItem('openedNotifications') || '[]');
                setOpenedNotificationIds(openedIds);

                const currentFriendRequests = friendsData.friendRequests.filter(
                    (r: any) => r.receiver._id === activeUser.user._id && r.status === 'pending'
                );

                const currentSharedNotes = notesData.filter(
                    (note: any) => typeof note.owner !== 'string' && note.owner._id !== activeUser.user._id
                );

                const currentBroadcasts = (broadcastFeedResponse.data as any).broadcasts || [];
                const primaryBroadcast = (activeBroadcastResponse.data as any).broadcast;

                setNotificationsData({
                    friendRequests: currentFriendRequests,
                    sharedNotes: currentSharedNotes,
                    broadcasts: currentBroadcasts
                });
                setActiveBroadcast(primaryBroadcast);

                const unreadRequests = currentFriendRequests.filter((r: any) => !openedIds.includes(r._id)).length;
                const unreadShared = currentSharedNotes.filter((n: any) => !openedIds.includes(n._id)).length;

                const dismissedId = localStorage.getItem('dismissedBroadcastId');
                const unreadBroadcasts = currentBroadcasts.filter(
                    (b: any) => b._id !== dismissedId && !openedIds.includes(b._id)
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
        const openedIds = JSON.parse(localStorage.getItem('openedNotifications') || '[]');
        if (!openedIds.includes(id)) {
            const newOpened = [...openedIds, id || ''];
            localStorage.setItem('openedNotifications', JSON.stringify(newOpened));
            setOpenedNotificationIds(newOpened);
            fetchNotifications();
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                if (!user) {
                    try {
                        const data = await getCurrentUser(token);
                        const transformedData: UserData = {
                            user: data.user,
                            role: data.role as 'superadmin' | 'admin' | 'user',
                        };
                        setUser(transformedData);
                        await fetchNotifications(transformedData, true);
                        initialLoadDone.current = true;

                        // role based routing logic
                        const userRoutes = ['/', '/friends', '/profile', '/notes', '/account-settings', '/notifications'];
                        if ((transformedData.role === 'admin' || transformedData.role === 'superadmin') && userRoutes.includes(pathname)) {
                            router.push('/admin/overview');
                        } else if (transformedData.role === 'user' && pathname.startsWith('/admin')) {
                            router.push('/');
                        }
                    } catch (error: any) {
                        localStorage.removeItem('token');
                        setUser(null);
                        if (!publicRoutes.includes(pathname)) {
                            router.push('/login');
                        }
                    }
                } else if (initialLoadDone.current) {
                    // Optimized: Only re-fetch on route change if it's been a while (e.g. 15 seconds)
                    const now = Date.now();
                    const refreshRoutes = ['/', '/dashboard', '/notes', '/friends', '/notifications'];
                    if (refreshRoutes.includes(pathname) && now - lastFetchRef.current > 15000) {
                        fetchNotifications();
                    }
                }
            } else if (!publicRoutes.includes(pathname)) {
                router.push('/login');
            }
            // Always set loading false after initial logic check
            setLoading(false);
        };
        fetchData();
    }, [router, pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setNotificationCount(0);
        setNoteCount(0);
        setFriendsCount(0);
        router.push('/login');
    };

    const refreshNotifications = useCallback(() => {
        fetchNotifications(undefined, true);
    }, [fetchNotifications]);

    return (
        <DashboardSharedContext.Provider
            value={{
                user,
                loading,
                handleLogout,
                isSidebarOpen,
                setIsSidebarOpen,
                setUser,
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
        </DashboardSharedContext.Provider>
    );
};

export const useDashboardSharedContext = () => {
    const context = useContext(DashboardSharedContext);
    if (!context) {
        throw new Error('useDashboardSharedContext must be used within a DashboardSharedProvider');
    }
    return context;
};