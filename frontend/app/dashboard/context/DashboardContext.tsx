'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

interface DashboardContextType {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
    const [activeTab, setActiveTab] = useState('dashboard'); // Default to 'dashboard'

    return (
        <DashboardContext.Provider value={{ activeTab, setActiveTab }}>
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