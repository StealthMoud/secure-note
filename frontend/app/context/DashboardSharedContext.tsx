'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser } from '@/services/auth';
import { User } from '@/services/auth';
import { getFriends } from '@/services/users';
import { getNotes } from '@/services/notes';

interface UserData {
    user: User;
    role: 'admin' | 'user';
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
}

const DashboardSharedContext = createContext<DashboardSharedContextType | undefined>(undefined);

export const DashboardSharedProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [notificationCount, setNotificationCount] = useState(0);
    const router = useRouter();
    const pathname = usePathname();

    // Define public routes that don't require authentication
    const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const token = localStorage.getItem('token');
            const [friendsData, notesData] = await Promise.all([
                getFriends(),
                getNotes(),
            ]);

            // Friend request notifications (pending incoming)
            const pendingFriendRequests = friendsData.friendRequests.filter(
                (r) => r.receiver._id === user.user._id && r.status === 'pending'
            ).length;

            // Note sharing notifications (notes shared with user)
            const sharedNotes = notesData.filter(
                (note) => typeof note.owner !== 'string' && note.owner._id !== user.user._id
            ).length;

            setNotificationCount(pendingFriendRequests + sharedNotes);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (token && !user) {
                try {
                    const data = await getCurrentUser(token);
                    const transformedData: UserData = {
                        user: data.user,
                        role: data.role as 'admin' | 'user',
                    };
                    setUser(transformedData);
                    await fetchNotifications();
                    // Role-based routing logic
                    const userRoutes = ['/', '/friends', '/profile', '/notes', '/account-settings', '/notifications'];
                    const adminRoutes = ['/admin/overview', '/admin/users', '/admin/notes', '/admin/verify'];
                    if (transformedData.role === 'admin' && userRoutes.includes(pathname)) {
                        router.push('/admin-overview');
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
            } else if (!token && !publicRoutes.includes(pathname)) {
                router.push('/login');
            }
            setLoading(false);
        };
        fetchData();
    }, [router, pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setNotificationCount(0);
        router.push('/login');
    };

    const refreshNotifications = () => {
        fetchNotifications();
    };

    return (
        <DashboardSharedContext.Provider
            value={{ user, loading, handleLogout, isSidebarOpen, setIsSidebarOpen, setUser, notificationCount, refreshNotifications }}
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