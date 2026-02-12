'use client';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SecurityLogsFiltersProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    severityFilter: string;
    setSeverityFilter: (severity: string) => void;
    onResetPage: () => void;
}

export const SecurityLogsFilters = ({
    searchTerm,
    setSearchTerm,
    severityFilter,
    setSeverityFilter,
    onResetPage
}: SecurityLogsFiltersProps) => {
    return (
        <div className="glass p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search events, users, or signals..."
                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium"
                />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
                <select
                    value={severityFilter}
                    onChange={(e) => { setSeverityFilter(e.target.value); onResetPage(); }}
                    className="flex-1 md:w-40 p-2.5 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                    <option value="">All Gravities</option>
                    <option value="low">Minimal</option>
                    <option value="medium">Standard</option>
                    <option value="high">Elevated</option>
                    <option value="critical">Critical</option>
                </select>
            </div>
        </div>
    );
};
