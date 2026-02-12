import React from 'react';
import {
    UserPlusIcon,
    ShareIcon,
    InformationCircleIcon,
    MegaphoneIcon,
} from '@heroicons/react/24/outline';
import { NotificationCard } from '@/components/notifications/NotificationCard';

interface NotificationItemProps {
    item: any; // Using any here temporarily as the item structure is complex/dynamic
    isRead: boolean;
    onDismissBroadcast: (id: string) => void;
    onMarkAsOpened: (id: string) => void;
    onRespondToRequest: (id: string, action: 'accept' | 'reject') => Promise<void>;
    refreshNotifications: () => void;
    loading: boolean;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
    item,
    isRead,
    onDismissBroadcast,
    onMarkAsOpened,
    onRespondToRequest,
    refreshNotifications,
    loading,
}) => {
    if (item.cardType === 'broadcast') {
        const typeColor =
            item.type === 'alert' ? 'text-rose-500 bg-rose-500/10' :
                item.type === 'warning' ? 'text-amber-500 bg-amber-500/10' :
                    'text-blue-500 bg-blue-500/10';
        const Icon =
            item.type === 'alert' ? MegaphoneIcon :
                item.type === 'warning' ? InformationCircleIcon :
                    MegaphoneIcon;

        return (
            <NotificationCard
                icon={Icon}
                title="System Announcement"
                description={item.message}
                time={new Date(item.createdAt).toLocaleDateString()}
                onDismiss={() => onDismissBroadcast(item._id)}
                onOpen={() => onMarkAsOpened(item._id)}
                typeColor={typeColor}
                isBroadcast={true}
                isRead={isRead}
            />
        );
    }

    if (item.cardType === 'request') {
        return (
            <NotificationCard
                icon={UserPlusIcon}
                title="New Friend Request"
                description={`${item.sender.username} sent you a friend request.`}
                time={new Date(item.createdAt).toLocaleDateString()}
                onAccept={() => {
                    onMarkAsOpened(item._id);
                    onRespondToRequest(item._id, 'accept').then(() => refreshNotifications());
                }}
                onReject={() => {
                    onMarkAsOpened(item._id);
                    onRespondToRequest(item._id, 'reject').then(() => refreshNotifications());
                }}
                onOpen={() => onMarkAsOpened(item._id)}
                loading={loading}
                isRead={isRead}
                typeColor="text-blue-500"
            />
        );
    }

    if (item.cardType === 'shared') {
        return (
            <NotificationCard
                icon={ShareIcon}
                title="Note Shared With You"
                description={`You've been given access to: "${item.title}".`}
                time={new Date(item.createdAt || '').toLocaleDateString()}
                onOpen={() => onMarkAsOpened(item._id)}
                isRead={isRead}
                typeColor="text-indigo-500"
            />
        );
    }

    return null;
};
