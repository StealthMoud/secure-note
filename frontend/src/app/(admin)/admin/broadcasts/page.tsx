'use client';

import { ExclamationCircleIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useBroadcasts } from '@/features/admin/hooks/useBroadcasts';
import { BroadcastHeader } from '@/components/admin/BroadcastHeader';
import { BroadcastForm } from '@/components/admin/BroadcastForm';
import { BroadcastHistory } from '@/components/admin/BroadcastHistory';

export default function BroadcastsPage() {
    const {
        message,
        setMessage,
        type,
        setType,
        loading,
        notifications,
        history,
        handleSend,
        dismissNotification
    } = useBroadcasts();

    return (
        <div className="max-w-4xl mx-auto p-6 animate-fadeInShort relative">
            {/* transmission signals */}
            <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
                {notifications.map(notification => (
                    <div
                        key={notification.id}
                        className={`flex items-center p-4 rounded-xl shadow-2xl transform transition-all duration-300 backdrop-blur-xl border ${notification.type === 'error'
                            ? 'bg-rose-100/90 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800/50'
                            : 'bg-emerald-100/90 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/50'
                            } ${notification.isExiting ? 'opacity-0 translate-x-12' : 'animate-slide-left'}`}
                    >
                        {notification.type === 'error' ? (
                            <ExclamationCircleIcon className="h-5 w-5 mr-3" />
                        ) : (
                            <CheckCircleIcon className="h-5 w-5 mr-3" />
                        )}
                        <p className="flex-1 text-xs font-black uppercase tracking-widest">{notification.message}</p>
                        <button
                            onClick={() => dismissNotification(notification.id)}
                            className="ml-3 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <XMarkIcon className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>

            <BroadcastHeader />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <BroadcastForm
                    message={message}
                    setMessage={setMessage}
                    type={type}
                    setType={setType}
                    loading={loading}
                    onSend={handleSend}
                />

                <BroadcastHistory history={history} />
            </div>
        </div>
    );
}
