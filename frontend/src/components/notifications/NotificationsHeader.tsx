'use client';

import React from 'react';

interface Tab {
    id: string;
    label: string;
    icon: React.ElementType;
    count: number;
}

interface NotificationsHeaderProps {
    tabs: Tab[];
    activeTab: string;
    setActiveTab: (id: string) => void;
}

export const NotificationsHeader: React.FC<NotificationsHeaderProps> = ({
    tabs,
    activeTab,
    setActiveTab
}) => {
    return (
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-gray-100 dark:border-white/5">
            <div>
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.4em] mb-2 text-center md:text-left">Activity Log</h3>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter italic flex items-center justify-center md:justify-start gap-4">
                    Your <span className="text-blue-600">Notifications</span>
                </h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium mt-3 max-w-md text-center md:text-left">Real-time updates on your notes and connections.</p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 p-1.5 glass rounded-[2rem] border-white/10">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 active:scale-95'
                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {tab.count > 0 && (
                            <span className={`ml-1 px-2 py-0.5 rounded-md text-[8px] ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </header>
    );
};
