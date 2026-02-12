'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser } from '@/services/auth';
import { User } from '@/types/user';

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
}

const DashboardSharedContext = createContext<DashboardSharedContextType | undefined>(undefined);

export const DashboardSharedProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const initialLoadDone = useRef<boolean>(false);

    // define public routes that dont require authentication
    const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

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
        router.push('/login');
    };

    return (
        <DashboardSharedContext.Provider
            value={{
                user,
                loading,
                handleLogout,
                isSidebarOpen,
                setIsSidebarOpen,
                setUser,
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