'use client';

import React from 'react';
import { DocumentTextIcon, MagnifyingGlassIcon, TagIcon } from '@heroicons/react/24/outline';

interface NotesHeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    tagFilter: string;
    setTagFilter: (filter: string) => void;
}

export const NotesHeader: React.FC<NotesHeaderProps> = ({
    searchQuery,
    setSearchQuery,
    tagFilter,
    setTagFilter,
}) => {
    return (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fadeInShort border-b border-gray-200/20 pb-8">
            <div>
                <h2 className="text-4xl font-black text-gray-900 dark:text-white flex items-center tracking-tight">
                    <div className="p-3 bg-blue-500 rounded-2xl mr-4 shadow-xl shadow-blue-500/20">
                        <DocumentTextIcon className="w-8 h-8 text-white" />
                    </div>
                    My Notes
                </h2>
            </div>

            <div className="flex flex-1 max-w-2xl gap-3">
                <div className="relative flex-1 group">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search notes..."
                        className="w-full pl-12 pr-4 py-3 border-0 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg shadow-black/5 ring-1 ring-black/5 focus:ring-2 focus:ring-blue-500 transition-all outline-none font-medium"
                    />
                </div>
                <div className="relative w-48 group hidden sm:block">
                    <TagIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        value={tagFilter}
                        onChange={(e) => setTagFilter(e.target.value)}
                        placeholder="Search tags..."
                        className="w-full pl-12 pr-4 py-3 border-0 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg shadow-black/5 ring-1 ring-black/5 focus:ring-2 focus:ring-blue-500 transition-all outline-none font-medium text-sm"
                    />
                </div>
            </div>
        </header>
    );
};
