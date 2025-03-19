'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/services/auth';

interface UserData {
    user: {
        _id: string;
        username: string;
        email: string;
        role: string;
        verified?: boolean;
        githubId?: string;
        firstName?: string;
        lastName?: string;
        nickname?: string;
        birthday?: string;
        country?: string;
        bio?: string;
        gender?: string;
        avatar?: string;
        header?: string;
        isTotpEnabled?: boolean;
    };
    role: string;
}

interface DashboardSharedContextType {
    user: UserData | null;
    loading: boolean;
    handleLogout: () => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    setUser: (user: UserData | null) => void; // Add setUser
}

const DashboardSharedContext = createContext<DashboardSharedContextType | undefined>(undefined);

export const DashboardSharedProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            console.log('Fetching user with token:', token);
            if (token && !user) { // Only fetch if no user is set
                try {
                    const data = await getCurrentUser(token);
                    console.log('User fetched successfully:', data);
                    setUser(data);
                    if (data.role === 'admin') {
                        router.push('/admin/verify');
                        return;
                    }
                } catch (error: any) {
                    console.error('Failed to fetch user:', error.message, error.response?.data);
                    localStorage.removeItem('token');
                }
            } else if (!token) {
                console.log('No token found in localStorage');
            }
            setLoading(false);
        };
        fetchData();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null); // Clear user on logout
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