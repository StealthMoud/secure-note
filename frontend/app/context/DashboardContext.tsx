'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface DashboardContextType {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    navigateToTab: (tab: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const router = useRouter();

    const navigateToTab = (tab: string) => {
        setActiveTab(tab);
        const path = tab === 'dashboard' ? '/' : `/${tab}`;
        router.push(path);
    };

    return (
        <DashboardContext.Provider value={{ activeTab, setActiveTab, navigateToTab }}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboardContext = () => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboardContext must be used within a DashboardProvider');
    }
    return context;
};