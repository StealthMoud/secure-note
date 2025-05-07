'use client';
import { useState, useEffect, useRef } from 'react';
import {
    ShieldCheckIcon,
    MagnifyingGlassIcon,
    ArrowsUpDownIcon,
    DocumentTextIcon,
    XCircleIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import api from '@/services/api';
import { useDebounce } from '@/app/utils/debounce';

// Define the SecurityLog interface based on SecurityLog model
interface SecurityLog {
    _id: string;
    event: string;
    user: { _id: string; username: string; email: string } | null; // Allow null for unpopulated user
    timestamp: string;
    details: Record<string, any>;
}

// Define response type for fetching logs
interface LogsResponse {
    message: string;
    logs: SecurityLog[];
}

// Define notification interface
interface Notification {
    id: string;
    message: string;
    type: 'error';
    isExiting?: boolean;
}

export default function SecurityLogsPage() {
    const [activeTab, setActiveTab] = useState('all-logs');
    const [logs, setLogs] = useState<SecurityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('timestamp-desc');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const notificationTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

    // Generate unique ID for notifications
    const generateNotificationId = () => `${Date.now()}-${Math.random()}`;

    // Add error notification
    const addNotification = (message: string) => {
        const id = generateNotificationId();
        setNotifications(prev => [...prev, { id, message, type: 'error', isExiting: false }]);

        // Auto-dismiss after 5 seconds
        const timeout = setTimeout(() => {
            dismissNotification(id);
        }, 5000);
        notificationTimeoutRef.current.set(id, timeout);
    };

    // Dismiss notification
    const dismissNotification = (id: string) => {
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, isExiting: true } : n))
        );
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
            const timeout = notificationTimeoutRef.current.get(id);
            if (timeout) {
                clearTimeout(timeout);
                notificationTimeoutRef.current.delete(id);
            }
        }, 300); // Match animation duration
    };

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            notificationTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
            notificationTimeoutRef.current.clear();
        };
    }, []);

    // Fetch logs
    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found');
                }
                const response = await api.get<LogsResponse>('/admin/logs', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setLogs(response.data.logs);
            } catch (err: any) {
                const errorMessage = err.response?.data?.error || err.message || 'Failed to load security logs';
                console.error('Fetch logs error:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status,
                    stack: err.stack,
                });
                addNotification(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const filteredLogs = logs
        .filter(log =>
            log.event.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            (log.user?.username?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ?? false) ||
            (log.user?.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ?? false)
        )
        .sort((a, b) => {
            if (sortOption === 'timestamp-desc') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            if (sortOption === 'timestamp-asc') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
            if (sortOption === 'event-asc') return a.event.localeCompare(b.event);
            if (sortOption === 'event-desc') return b.event.localeCompare(a.event);
            return 0;
        });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <svg
                    className="animate-spin h-8 w-8 text-blue-500 dark:text-blue-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
                <span className="ml-2 text-gray-700 dark:text-gray-300">Loading security logs...</span>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 animate-fadeInShort relative">
            <style jsx>{`
                @keyframes fadeInShort {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                @keyframes fadeInCard {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fadeInShort { animation: fadeInShort 0.5s ease-out; }
                .animate-slideIn { animation: slideIn 0.3s ease-out; }
                .animate-slideOut { animation: slideOut 0.3s ease-in; }
                .animate-fadeInCard { animation: fadeInCard 0.6s ease-out forwards; }
            `}</style>

            {/* Notification Popups (only for errors) */}
            <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
                {notifications.map(notification => (
                    <div
                        key={notification.id}
                        className={`flex items-center p-4 rounded-lg shadow-lg transform transition-all duration-300 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 ${notification.isExiting ? 'animate-slideOut' : 'animate-slideIn'}`}
                    >
                        <XCircleIcon className="h-6 w-6 mr-2" />
                        <p className="flex-1 text-sm">{notification.message}</p>
                        <button
                            onClick={() => dismissNotification(notification.id)}
                            className="ml-2 focus:outline-none"
                            aria-label="Dismiss notification"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                ))}
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center mb-6">
                <ShieldCheckIcon className="w-8 h-8 mr-2 text-gray-700 dark:text-gray-300 animate-pulse" />
                Manage Security Logs
            </h2>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    className={`px-4 py-2 ${activeTab === 'all-logs' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
                    onClick={() => setActiveTab('all-logs')}
                >
                    All Logs
                </button>
                <button
                    className={`px-4 py-2 ${activeTab === 'log-details' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
                    onClick={() => setActiveTab('log-details')}
                >
                    Log Details
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'all-logs' && (
                <LogList
                    logs={filteredLogs}
                    addNotification={addNotification}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                />
            )}
            {activeTab === 'log-details' && <LogDetails logs={logs} addNotification={addNotification} />}
        </div>
    );
}

function LogList({
                     logs,
                     addNotification,
                     searchTerm,
                     setSearchTerm,
                     sortOption,
                     setSortOption,
                 }: {
    logs: SecurityLog[];
    addNotification: (message: string) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    sortOption: string;
    setSortOption: (option: string) => void;
}) {
    return (
        <div>
            <div className="flex items-center mb-4">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by event, username, or email..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-slate-600 dark:focus:ring-slate-400 transition duration-200"
                    />
                </div>
                <div className="ml-4 flex items-center">
                    <ArrowsUpDownIcon className="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500" />
                    <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="p-2 border rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-slate-600 dark:focus:ring-slate-400 transition duration-200"
                    >
                        <option value="timestamp-desc">Timestamp (Newest)</option>
                        <option value="timestamp-asc">Timestamp (Oldest)</option>
                        <option value="event-asc">Event A-Z</option>
                        <option value="event-desc">Event Z-A</option>
                    </select>
                </div>
            </div>
            <div className="overflow-y-auto max-h-[500px] border border-gray-200 dark:border-gray-700 rounded-lg">
                {logs.length === 0 ? (
                    <p className="p-4 text-gray-600 dark:text-gray-300">No logs found.</p>
                ) : (
                    logs.map((log, index) => (
                        <div
                            key={log._id}
                            className={`p-4 border-b dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-500 ease-in-out transform hover:scale-105 hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] animate-fadeInCard`}
                            style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                        >
                            <div>
                                <p className="text-gray-900 dark:text-gray-100">
                                    <strong>Event:</strong> {log.event}
                                </p>
                                <p className="text-gray-600 dark:text-gray-300">
                                    <strong>User:</strong>{' '}
                                    {log.user ? `${log.user.username} (${log.user.email})` : 'Unknown User'}
                                </p>
                                <p className="text-gray-600 dark:text-gray-300">
                                    <strong>Timestamp:</strong> {new Date(log.timestamp).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function LogDetails({ logs, addNotification }: { logs: SecurityLog[]; addNotification: (message: string) => void }) {
    const [selectedLog, setSelectedLog] = useState<string | null>(null);
    const [logDetails, setLogDetails] = useState<SecurityLog | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedLog) {
            setLoading(true);
            const log = logs.find(l => l._id === selectedLog);
            if (log) {
                setLogDetails(log);
            } else {
                addNotification('Log not found');
            }
            setLoading(false);
        }
    }, [selectedLog, logs, addNotification]);

    return (
        <div>
            <select
                onChange={(e) => setSelectedLog(e.target.value || null)}
                className="w-full p-2 mb-4 border rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-slate-600 dark:focus:ring-slate-400 transition duration-200"
            >
                <option value="">Select a log</option>
                {logs.map((log) => (
                    <option key={log._id} value={log._id}>
                        {log.event} - {log.user ? log.user.username : 'Unknown'} (
                        {new Date(log.timestamp).toLocaleDateString()})
                    </option>
                ))}
            </select>
            {loading && (
                <div className="flex items-center justify-center">
                    <svg
                        className="animate-spin h-8 w-8 text-blue-500 dark:text-blue-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Loading details...</span>
                </div>
            )}
            {logDetails && (
                <div
                    className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-500 ease-in-out transform hover:scale-105 hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] animate-fadeInCard"
                >
                    <div className="flex items-center">
                        <DocumentTextIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                        <div>
                            <p className="text-gray-900 dark:text-gray-100">
                                <strong>Event:</strong> {logDetails.event}
                            </p>
                            <p className="text-gray-900 dark:text-gray-100">
                                <strong>User:</strong>{' '}
                                {logDetails.user ? `${logDetails.user.username} (${logDetails.user.email})` : 'Unknown User'}
                            </p>
                            <p className="text-gray-900 dark:text-gray-100">
                                <strong>Timestamp:</strong> {new Date(logDetails.timestamp).toLocaleString()}
                            </p>
                            <p className="text-gray-900 dark:text-gray-100">
                                <strong>Details:</strong>
                                <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded">
                                    {JSON.stringify(logDetails.details, null, 2)}
                                </pre>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}