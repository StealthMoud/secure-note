import React from 'react';
import { EnvelopeOpenIcon } from '@heroicons/react/24/outline';
import { NotificationItem } from './NotificationItem';

interface NotificationsListProps {
    content: any[];
    openedNotificationIds: string[];
    onDismissBroadcast: (id: string) => void;
    onMarkAsOpened: (id: string) => void;
    onRespondToRequest: (id: string, action: 'accept' | 'reject') => Promise<void>;
    refreshNotifications: () => void;
    loading: boolean;
}

export const NotificationsList: React.FC<NotificationsListProps> = ({
    content,
    openedNotificationIds,
    onDismissBroadcast,
    onMarkAsOpened,
    onRespondToRequest,
    refreshNotifications,
    loading,
}) => {
    if (content.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center glass rounded-[3.5rem] border-white/10 shadow-2xl">
                <div className="p-10 rounded-3xl glass border-white/10 mb-8 shadow-inner animate-pulse-subtle">
                    <EnvelopeOpenIcon className="w-20 h-20 text-gray-300 dark:text-gray-700" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight italic">No Notifications</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mt-3 font-medium">You're all caught up in this category.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6">
            {content.map((item) => (
                <NotificationItem
                    key={item._id}
                    item={item}
                    isRead={openedNotificationIds.includes(item._id)}
                    onDismissBroadcast={onDismissBroadcast}
                    onMarkAsOpened={onMarkAsOpened}
                    onRespondToRequest={onRespondToRequest}
                    refreshNotifications={refreshNotifications}
                    loading={loading}
                />
            ))}
        </div>
    );
};
