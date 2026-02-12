'use client';
import { SecurityLog } from '@/types/admin';
import { SecurityLogItem } from './SecurityLogItem';

interface SecurityLogsListProps {
    logs: SecurityLog[];
    expandedLog: string | null;
    onToggleLog: (id: string | null) => void;
}

export const SecurityLogsList = ({ logs, expandedLog, onToggleLog }: SecurityLogsListProps) => {
    if (logs.length === 0) {
        return (
            <div className="glass p-12 rounded-2xl text-center border-dashed border-gray-200 dark:border-white/10">
                <p className="text-gray-400 font-bold italic">no intelligence signals found in this sector.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {logs.map((log) => (
                <SecurityLogItem
                    key={log._id}
                    log={log}
                    isExpanded={expandedLog === log._id}
                    onToggle={() => onToggleLog(expandedLog === log._id ? null : log._id)}
                />
            ))}
        </div>
    );
};
