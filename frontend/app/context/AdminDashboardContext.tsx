'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardSharedContext } from '@/app/context/DashboardSharedContext';

interface AdminDashboardContextType {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    navigateToTab: (tab: string) => void;
}

const AdminDashboardContext = createContext<AdminDashboardContextType | undefined>(undefined);

export const AdminDashboardProvider = ({ children }: { children: ReactNode }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const router = useRouter();
    const { setIsSidebarOpen } = useDashboardSharedContext();

    const navigateToTab = (tab: string) => {
        console.log(`navigateToTab - tab: ${tab}, setting activeTab and navigating`);
        setActiveTab(tab);
        router.push(`/admin/${tab}`);
        console.log('Ensuring sidebar is open in navigateToTab');
        setIsSidebarOpen(true);
    };

    return (
        <AdminDashboardContext.Provider value={{ activeTab, setActiveTab, navigateToTab }}>
            {children}
        </AdminDashboardContext.Provider>
    );
};

export const useAdminDashboardContext = () => {
    const context = useContext(AdminDashboardContext);
    if (!context) {
        throw new Error('useAdminDashboardContext must be used within an AdminDashboardProvider');
    }
    return context;
};