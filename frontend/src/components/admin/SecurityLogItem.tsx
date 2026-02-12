'use client';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { SecurityLog } from '@/types/admin';

interface SecurityLogItemProps {
    log: SecurityLog;
    isExpanded: boolean;
    onToggle: () => void;
}

export const SecurityLogItem = ({ log, isExpanded, onToggle }: SecurityLogItemProps) => {

    // utility to format log details for human nodes
    const formatLogDetail = (log: SecurityLog) => {
        const userStr = log.user ? log.user.username : 'System Core';
        switch (log.event) {
            case 'login_success': return `User '${userStr}' authenticated successfully.`;
            case 'login_failure': return `failed login attempt for account '${log.details.email || 'unknown'}'.`;
            case 'note_created': return `User '${userStr}' created a new secure note.`;
            case 'note_shared': return `User '${userStr}' shared a note with ${log.details.sharedWith || 'another user'}.`;
            case 'profile_updated': return `User '${userStr}' updated their digital identity.`;
            case 'user_verified': return `User '${userStr}' identity was verified by the system.`;
            default: return `${userStr} performed action: ${log.event.replace(/_/g, ' ')}.`;
        }
    };

    return (
        <div className="glass rounded-xl overflow-hidden transition-all hover:bg-white/30 dark:hover:bg-white/5 group">
            <button
                onClick={onToggle}
                className="w-full p-5 flex items-center justify-between text-left"
            >
                <div className="flex items-center gap-5">
                    <div className={`w-2.5 h-2.5 rounded-full ${log.severity === 'critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                        log.severity === 'high' ? 'bg-orange-500' :
                            log.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                        }`} />
                    <div>
                        <p className="text-sm font-black text-gray-900 dark:text-white mb-1 uppercase tracking-tight italic">
                            {log.event.replace(/_/g, ' ')}
                        </p>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <span>{log.user ? log.user.username : 'System Core'}</span>
                            <span className="opacity-30">•</span>
                            <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="hidden md:block text-[10px] font-black text-gray-300 dark:text-gray-500 uppercase tracking-[0.2em]">
                        Node {log._id.slice(-6)}
                    </span>
                    <div className={`p-2 rounded-lg bg-gray-50 dark:bg-white/5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        <ArrowDownTrayIcon className="w-4 h-4 text-gray-400 rotate-180" />
                    </div>
                </div>
            </button>

            {isExpanded && (
                <div className="px-5 pb-5 pt-0 animate-scale-in">
                    <div className="p-4 bg-gray-50/50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 space-y-4">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Intelligence Summary</p>
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{formatLogDetail(log)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Trace Metadata</p>
                            <pre className="text-[10px] font-mono text-blue-600 dark:text-blue-400 overflow-x-auto p-3 bg-white dark:bg-black/20 rounded-lg border border-gray-100 dark:border-white/5">
                                {JSON.stringify(log.details, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
