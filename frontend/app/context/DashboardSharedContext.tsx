'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/services/auth';


interface UserData {
    user: { _id: string; username: string; email: string; role: string; verified?: boolean };
    role: string;
}

interface DashboardSharedContextType {
    user: UserData | null;
    loading: boolean;
    handleLogout: () => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
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
            if (token) {
                try {
                    const data = await getCurrentUser(token);
                    setUser(data);
                    if (data.role === 'admin') {
                        router.push('/admin/verify')
                        return;
                    }
                } catch (error: any) {
                    console.error('Failed to fetch user:', error);
                    localStorage.removeItem('token');
                    // page.tsx handles further redirects
                }
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    return (
        <DashboardSharedContext.Provider value={{ user, loading, handleLogout, isSidebarOpen, setIsSidebarOpen }}>
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