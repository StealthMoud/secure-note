'use client';
import { useState, useEffect, useRef } from 'react';
import {
    ShieldCheckIcon,
    MagnifyingGlassIcon,
    ArrowsUpDownIcon,
    DocumentTextIcon,
    XCircleIcon,
    XMarkIcon,
    ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import api from '@/services/api';
import { useDebounce } from '@/lib/utils/debounce';

// define the securitylog interface based on securitylog model
interface SecurityLog {
    _id: string;
    event: string;
    user: { _id: string; username: string; email: string } | null; // allow null for unpopulated user
    timestamp: string;
    details: Record<string, any>;
    severity?: 'low' | 'medium' | 'high' | 'critical';
}

// define response type for fetching logs
interface LogsResponse {
    message: string;
    logs: SecurityLog[];
    total: number;
    pages: number;
    currentPage: number;
}

// define notification interface
interface Notification {
    id: string;
    message: string;
    type: 'error';
    isExiting?: boolean;
}

export default function SecurityLogsPage() {
    const [logs, setLogs] = useState<SecurityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [severityFilter, setSeverityFilter] = useState<string>('');
    const [expandedLog, setExpandedLog] = useState<string | null>(null);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const notificationTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

    // generate unique id for notifications
    const generateNotificationId = () => `${Date.now()}-${Math.random()}`;

    // add error notification
    const addNotification = (message: string) => {
        const id = generateNotificationId();
        setNotifications(prev => [...prev, { id, message, type: 'error', isExiting: false }]);
        const timeout = setTimeout(() => dismissNotification(id), 5000);
        notificationTimeoutRef.current.set(id, timeout);
    };

    const dismissNotification = (id: string) => {
        setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isExiting: true } : n)));
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
            notificationTimeoutRef.current.delete(id);
        }, 300);
    };

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await api.get<LogsResponse>('/admin/logs', {
                    headers: { Authorization: `Bearer ${token}` },
                    params: {
                        page: currentPage,
                        limit: 10,
                        severity: severityFilter || undefined,
                        search: debouncedSearchTerm || undefined
                    }
                });
                setLogs(response.data.logs);
                setTotalPages(response.data.pages);
            } catch (err: any) {
                addNotification(err.response?.data?.error || 'failed to load logs');
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [currentPage, severityFilter, debouncedSearchTerm]);

    const handleExportLogs = async (format: 'csv' | 'pdf') => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.get(`/admin/logs/export`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { format, severity: severityFilter || undefined },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `security_logs_${Date.now()}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err: any) {
            addNotification('export failed');
        }
    };

    const formatLogDetail = (log: SecurityLog) => {
        const userStr = log.user ? log.user.username : 'System';
        switch (log.event) {
            case 'login_success': return `User '${userStr}' authenticated successfully.`;
            case 'login_failure': return `Failed login attempt for account '${log.details.email || 'unknown'}'.`;
            case 'note_created': return `User '${userStr}' created a new secure note.`;
            case 'note_shared': return `User '${userStr}' shared a note with ${log.details.sharedWith || 'another user'}.`;
            case 'profile_updated': return `User '${userStr}' updated their digital identity.`;
            case 'user_verified': return `User '${userStr}' identity was verified by the system.`;
            default: return `${userStr} performed action: ${log.event.replace(/_/g, ' ')}.`;
        }
    };

    if (loading && logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-gray-500 font-black text-xs uppercase tracking-widest">Syncing Logs...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-slide-up-fade">
            {/* notifications */}
            <div className="fixed top-6 right-6 z-50 space-y-3">
                {notifications.map(n => (
                    <div key={n.id} className={`glass p-4 rounded-xl flex items-center gap-3 border-red-500/20 text-red-600 dark:text-red-400 shadow-xl transition-all ${n.isExiting ? 'opacity-0 scale-95' : 'animate-scale-in'}`}>
                        <XCircleIcon className="w-5 h-5" />
                        <p className="text-xs font-bold">{n.message}</p>
                    </div>
                ))}
            </div>

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">
                        <ShieldCheckIcon className="w-3 h-3" />
                        Audit Trail
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight italic">Security <span className="text-blue-600">Intelligence</span></h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Monitor all node activities and system events.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => handleExportLogs('csv')} className="px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-all active:scale-95 flex items-center gap-2">
                        <ArrowDownTrayIcon className="w-3.5 h-3.5" /> CSV Export
                    </button>
                    <button onClick={() => handleExportLogs('pdf')} className="px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-red-500 transition-all active:scale-95 flex items-center gap-2">
                        <ArrowDownTrayIcon className="w-3.5 h-3.5" /> PDF Dump
                    </button>
                </div>
            </header>

            {/* filters */}
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
                        onChange={(e) => { setSeverityFilter(e.target.value); setCurrentPage(1); }}
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

            {/* list */}
            <div className="space-y-3">
                {logs.length === 0 ? (
                    <div className="glass p-12 rounded-2xl text-center border-dashed border-gray-200 dark:border-white/10">
                        <p className="text-gray-400 font-bold italic">No intelligence signals found in this sector.</p>
                    </div>
                ) : (
                    logs.map((log) => (
                        <div key={log._id} className="glass rounded-xl overflow-hidden transition-all hover:bg-white/30 dark:hover:bg-white/5 group">
                            <button
                                onClick={() => setExpandedLog(expandedLog === log._id ? null : log._id)}
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
                                    <div className={`p-2 rounded-lg bg-gray-50 dark:bg-white/5 transition-transform ${expandedLog === log._id ? 'rotate-180' : ''}`}>
                                        <ArrowDownTrayIcon className="w-4 h-4 text-gray-400 rotate-180" />
                                    </div>
                                </div>
                            </button>

                            {expandedLog === log._id && (
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
                    ))
                )}
            </div>

            {/* pagination */}
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