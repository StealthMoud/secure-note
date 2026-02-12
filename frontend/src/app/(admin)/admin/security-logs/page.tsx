'use client';

import { XCircleIcon } from '@heroicons/react/24/outline';
import { useSecurityLogs } from '@/features/admin/hooks/useSecurityLogs';
import { SecurityLogsHeader } from '@/components/admin/SecurityLogsHeader';
import { SecurityLogsFilters } from '@/components/admin/SecurityLogsFilters';
import { SecurityLogsList } from '@/components/admin/SecurityLogsList';

export default function SecurityLogsPage() {
    const {
        logs,
        loading,
        notifications,
        searchTerm,
        setSearchTerm,
        currentPage,
        setCurrentPage,
        totalPages,
        severityFilter,
        setSeverityFilter,
        expandedLog,
        setExpandedLog,
        handleExport,
        dismissNotification
    } = useSecurityLogs();

    if (loading && logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-gray-500 font-black text-xs uppercase tracking-widest">syncing logs...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-slide-up-fade">
            {/* intelligence notifications */}
            <div className="fixed top-6 right-6 z-50 space-y-3">
                {notifications.map(n => (
                    <div
                        key={n.id}
                        className={`glass p-4 rounded-xl flex items-center gap-3 border-red-500/20 text-red-600 dark:text-red-400 shadow-xl transition-all ${n.isExiting ? 'opacity-0 scale-95' : 'animate-scale-in'}`}
                        onClick={() => dismissNotification(n.id)}
                    >
                        <XCircleIcon className="w-5 h-5" />
                        <p className="text-xs font-bold">{n.message}</p>
                    </div>
                ))}
            </div>

            <SecurityLogsHeader onExport={handleExport} />

            <SecurityLogsFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                severityFilter={severityFilter}
                setSeverityFilter={setSeverityFilter}
                onResetPage={() => setCurrentPage(1)}
            />

            <SecurityLogsList
                logs={logs}
                expandedLog={expandedLog}
                onToggleLog={setExpandedLog}
            />

            {/* sector navigation */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between py-4">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-6 py-2 glass rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 disabled:opacity-30 transition-all active:scale-95"
                    >
                        Prev Sector
                    </button>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Sector {currentPage} <span className="opacity-30">/</span> {totalPages}
                        </span>
                    </div>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-6 py-2 glass rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 disabled:opacity-30 transition-all active:scale-95"
                    >
                        Next Sector
                    </button>
                </div>
            )}
        </div>
    );
}