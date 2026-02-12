'use client';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface UserFiltersProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    currentTab: 'all-users' | 'pending-verifications' | 'admins' | 'add-user' | 'activity';
    setCurrentTab: (tab: 'all-users' | 'pending-verifications' | 'admins' | 'add-user' | 'activity') => void;
    pendingCount: number;
}

export const UserFilters = ({
    searchTerm,
    setSearchTerm,
    currentTab,
    setCurrentTab,
    pendingCount
}: UserFiltersProps) => {

    const tabLabels: Record<string, string> = {
        'all-users': 'All Users',
        'pending-verifications': 'Pending Verification',
        'admins': 'Admins',
        'activity': 'Activity',
        'add-user': 'Add User',
    };

    return (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl w-fit">
                {(['all-users', 'pending-verifications', 'admins', 'activity', 'add-user'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setCurrentTab(tab)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentTab === tab
                            ? 'bg-white dark:bg-white/10 text-blue-600 shadow-sm'
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                    >
                        {tabLabels[tab]}
                        {tab === 'pending-verifications' && pendingCount > 0 && (
                            <span className="ml-2 bg-rose-500 text-white px-1.5 py-0.5 rounded-full text-[8px] animate-pulse">
                                {pendingCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {currentTab !== 'add-user' && currentTab !== 'activity' && (
                <div className="relative w-full lg:w-96 group">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by username, email or name..."
                        className="w-full pl-11 pr-4 py-3 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all text-sm font-medium"
                    />
                </div>
            )}
        </div>
    );
};
