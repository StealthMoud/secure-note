// /frontend/app/admin/security-logs/page.tsx
'use client';
import { useState, useEffect } from 'react';
import {
    ShieldCheckIcon,
    MagnifyingGlassIcon,
    ArrowsUpDownIcon,
    DocumentTextIcon,
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

export default function SecurityLogsPage() {
    const [activeTab, setActiveTab] = useState('all-logs');
    const [logs, setLogs] = useState<SecurityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('timestamp-desc');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await api.get<LogsResponse>('/admin/logs', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setLogs(response.data.logs);
            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to load security logs');
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

    if (loading) return <div className="text-center mt-10">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center mb-6">
                <ShieldCheckIcon className="w-8 h-8 mr-2 text-gray-700 dark:text-gray-300" />
                Manage Security Logs
            </h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    className={`px-4 py-2 ${activeTab === 'all-logs' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('all-logs')}
                >
                    All Logs
                </button>
                <button
                    className={`px-4 py-2 ${activeTab === 'log-details' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('log-details')}
                >
                    Log Details
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'all-logs' && (
                <LogList
                    logs={filteredLogs}
                    setError={setError}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                />
            )}
            {activeTab === 'log-details' && <LogDetails logs={logs} setError={setError} />}
        </div>
    );
}

function LogList({
                     logs,
                     setError,
                     searchTerm,
                     setSearchTerm,
                     sortOption,
                     setSortOption,
                 }: {
    logs: SecurityLog[];
    setError: (error: string) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    sortOption: string;
    setSortOption: (option: string) => void;
}) {
    return (
        <div>
            <div className="flex items-center mb-4">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by event, username, or email..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                    />
                </div>
                <div className="ml-4 flex items-center">
                    <ArrowsUpDownIcon className="w-5 h-5 mr-2 text-gray-400" />
                    <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="p-2 border rounded-lg dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                    >
                        <option value="timestamp-desc">Timestamp (Newest)</option>
                        <option value="timestamp-asc">Timestamp (Oldest)</option>
                        <option value="event-asc">Event A-Z</option>
                        <option value="event-desc">Event Z-A</option>
                    </select>
                </div>
            </div>
            <div className="overflow-y-auto max-h-[500px] border border-gray-200 dark:border-gray-700 rounded-lg">
                {logs.map((log) => (
                    <div
                        key={log._id}
                        className="p-4 border-b dark:border-gray-700 flex justify-between items-center"
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
                ))}
            </div>
        </div>
    );
}

function LogDetails({ logs, setError }: { logs: SecurityLog[]; setError: (error: string) => void }) {
    const [selectedLog, setSelectedLog] = useState<string | null>(null);
    const [logDetails, setLogDetails] = useState<SecurityLog | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedLog) {
            setLoading(true);
            const log = logs.find(l => l._id === selectedLog);
            if (log) {
                setLogDetails(log);
                setLoading(false);
            } else {
                setError('Log not found');
                setLoading(false);
            }
        }
    }, [selectedLog, logs, setError]);

    return (
        <div>
            <select
                onChange={(e) => setSelectedLog(e.target.value || null)}
                className="w-full p-2 mb-4 border rounded-lg dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            >
                <option value="">Select a log</option>
                {logs.map((log) => (
                    <option key={log._id} value={log._id}>
                        {log.event} - {log.user ? log.user.username : 'Unknown'} (
                        {new Date(log.timestamp).toLocaleDateString()})
                    </option>
                ))}
            </select>
            {loading && <p>Loading details...</p>}
            {logDetails && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center">
                    <DocumentTextIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                    <div>
                        <p><strong>Event:</strong> {logDetails.event}</p>
                        <p>
                            <strong>User:</strong>{' '}
                            {logDetails.user ? `${logDetails.user.username} (${logDetails.user.email})` : 'Unknown User'}
                        </p>
                        <p><strong>Timestamp:</strong> {new Date(logDetails.timestamp).toLocaleString()}</p>
                        <p><strong>Details:</strong> {JSON.stringify(logDetails.details, null, 2)}</p>
                    </div>
                </div>
            )}
        </div>
    );
}