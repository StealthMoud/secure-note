'use client';
import { useState, useRef, useEffect } from 'react';
import {
    MegaphoneIcon,
    PaperAirplaneIcon,
    InformationCircleIcon,
    ExclamationTriangleIcon,
    ExclamationCircleIcon,
    CheckCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { sendBroadcast, getBroadcasts } from '@/services/adminService';

interface Notification {
    id: string;
    message: string;
    type: 'error' | 'success';
    isExiting?: boolean;
}

export default function BroadcastsPage() {
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'info' | 'warning' | 'alert'>('info');
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const notificationTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

    // generate unique id for notifications
    const generateNotificationId = () => `${Date.now()}-${Math.random()}`;

    // add notification
    const addNotification = (message: string, type: 'error' | 'success') => {
        const id = generateNotificationId();
        setNotifications(prev => [...prev, { id, message, type }]);

        const timeout = setTimeout(() => {
            dismissNotification(id);
        }, 5000);
        notificationTimeoutRef.current.set(id, timeout);
    };

    // dismiss notification
    const dismissNotification = (id: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, isExiting: true } : n
        ));
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
            const timeout = notificationTimeoutRef.current.get(id);
            if (timeout) {
                clearTimeout(timeout);
                notificationTimeoutRef.current.delete(id);
            }
        }, 300);
    };

    const fetchHistory = async () => {
        try {
            const data = await getBroadcasts();
            if (data.broadcasts) {
                setHistory(data.broadcasts);
            }
        } catch (err) {
            console.error('Failed to fetch history', err);
        }
    };

    useEffect(() => {
        fetchHistory();
        return () => {
            notificationTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
            notificationTimeoutRef.current.clear();
        };
    }, []);

    const handleSend = async () => {
        if (!message.trim()) {
            addNotification('Message cannot be empty', 'error');
            return;
        }

        setLoading(true);
        try {
            await sendBroadcast({ message, type });
            addNotification('Broadcast sent successfully', 'success');
            setMessage('');
            fetchHistory();
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.message || 'Failed to send broadcast';
            addNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const getTypeColor = (t: string) => {
        switch (t) {
            case 'warning': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case 'alert': return 'text-red-500 bg-red-500/10 border-red-500/20';
            default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
        }
    };

    const getTypeIcon = (t: string) => {
        switch (t) {
            case 'warning': return ExclamationTriangleIcon;
            case 'alert': return ExclamationCircleIcon;
            default: return InformationCircleIcon;
        }
    };

    const PreviewIcon = getTypeIcon(type);

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
                .animate-slideIn { animation: slideIn 0.3s ease-out; }
                .animate-slideOut { animation: slideOut 0.3s ease-in; }
            `}</style>

            {/* notifications */}
            <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
                {notifications.map(notification => (
                    <div
                        key={notification.id}
                        className={`flex items-center p-4 rounded-lg shadow-lg transform transition-all duration-300 ${notification.type === 'error'
                            ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            } ${notification.isExiting ? 'animate-slideOut' : 'animate-slideIn'}`}
                    >
                        {notification.type === 'error' ? (
                            <ExclamationCircleIcon className="h-6 w-6 mr-2" />
                        ) : (
                            <CheckCircleIcon className="h-6 w-6 mr-2" />
                        )}
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

            <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <MegaphoneIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">System Broadcasts</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Send global alerts to all active nodes</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-xl backdrop-blur-xl">
                        <div className="mb-6">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Broadcast Type</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['info', 'warning', 'alert'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setType(t as any)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${type === t
                                            ? getTypeColor(t)
                                            : 'border-transparent bg-gray-50 dark:bg-white/5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
                                            }`}
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-wider">{t}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Message Content</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter system broadcast message..."
                                className="w-full h-40 p-4 rounded-xl bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-blue-500/50 focus:bg-white dark:focus:bg-black/20 text-gray-900 dark:text-white resize-none transition-all outline-none text-sm leading-relaxed"
                            />
                        </div>

                        <button
                            onClick={handleSend}
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95 ${loading
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                }`}
                        >
                            {loading ? (
                                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                            ) : (
                                <>
                                    <PaperAirplaneIcon className="w-5 h-5" />
                                    <span>Transmit Broadcast</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Preview Section */}
                <div className="space-y-6">

                    {/* History Section */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-xl backdrop-blur-xl">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Transmission Log</h3>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                            {history.length === 0 ? (
                                <p className="text-sm text-gray-400 italic">No broadcast history available.</p>
                            ) : (
                                history.map((broadcast) => (
                                    <div key={broadcast._id} className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${broadcast.type === 'alert' ? 'bg-red-500/10 text-red-500' :
                                                broadcast.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                                                    'bg-blue-500/10 text-blue-500'
                                                }`}>
                                                {broadcast.type}
                                            </div>
                                            <span className="text-[10px] text-gray-400 font-mono">
                                                {new Date(broadcast.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                                            {broadcast.message}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-white/5">
                                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-[8px] text-white font-bold">
                                                {broadcast.createdBy?.username?.[0] || 'A'}
                                            </div>
                                            <span className="text-[10px] text-gray-400">
                                                By {broadcast.createdBy?.username || 'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
