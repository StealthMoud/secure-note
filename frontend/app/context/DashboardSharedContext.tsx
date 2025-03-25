'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Add usePathname
import { getCurrentUser } from '@/services/auth';
import { User } from '@/services/auth';

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
}

const DashboardSharedContext = createContext<DashboardSharedContextType | undefined>(undefined);

export const DashboardSharedProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const router = useRouter();
    const pathname = usePathname(); // Get current path

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            console.log('Fetching user with token:', token);
            if (token && !user) {
                try {
                    const data = await getCurrentUser(token);
                    console.log('User fetched successfully:', data);
                    const transformedData: UserData = {
                        user: data.user,
                        role: data.role as 'admin' | 'user',
                    };
                    if (!['admin', 'user'].includes(data.role)) {
                        throw new Error('Invalid role received from server');
                    }
                    setUser(transformedData);

                    // Define valid dashboard routes
                    const validRoutes = ['/', '/friends', '/profile', '/notes', '/account-settings', '/notifications'];
                    const isValidRoute = validRoutes.includes(pathname);

                    // Only redirect if not already on a valid route
                    if (!isValidRoute) {
                        if (transformedData.role === 'admin') {
                            console.log('Redirecting admin to /admin');
                            router.push('/admin');
                        } else {
                            console.log('Redirecting regular user to /');
                            router.push('/');
                        }
                    }
                } catch (error: any) {
                    console.error('Failed to fetch user:', error.message, error.response?.data);
                    localStorage.removeItem('token');
                    setUser(null);
                    router.push('/login');
                }
            } else if (!token) {
                console.log('No token found in localStorage');
                router.push('/login');
            }
            setLoading(false);
        };
        fetchData();
    }, [router, pathname]); // Add pathname as dependency

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    };

    return (
        <DashboardSharedContext.Provider value={{ user, loading, handleLogout, isSidebarOpen, setIsSidebarOpen, setUser }}>
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