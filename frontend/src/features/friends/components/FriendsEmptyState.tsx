import React from 'react';

interface FriendsEmptyStateProps {
    icon: React.ElementType;
    title: string;
    description: string;
}

export const FriendsEmptyState: React.FC<FriendsEmptyStateProps> = ({ icon: Icon, title, description }) => (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fadeInShort">
        <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-600 mb-6">
            <Icon className="w-16 h-16" />
        </div>
        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{title}</h3>
        <p className="text-gray-500 dark:text-slate-400 max-w-xs mt-2 font-medium">{description}</p>
    </div>
);
