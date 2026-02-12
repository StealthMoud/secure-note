'use client';

import { useState, useMemo } from 'react';
import { useNotificationsLogic } from '@/features/notifications/hooks/useNotifications';
import {
    UserPlusIcon,
    ShareIcon,
    ShieldCheckIcon,
    SparklesIcon,
    MegaphoneIcon,
    ListBulletIcon
} from '@heroicons/react/24/outline';
import { NotificationsHeader } from '@/components/notifications/NotificationsHeader';
import { useNotificationContext } from '@/context/NotificationContext';
import { FeedbackToasts } from '@/components/ui';
import { NotificationsList } from '@/features/notifications/components/NotificationsList';

export default function NotificationsSection() {
    const {
        friendRequests,
        sharedNotes,
        respondToFriendRequest,
        loading,
        message,
        error,
        isExitingError,
        isExitingMessage,
        dismissMessage,
    } = useNotificationsLogic();

    const { refreshNotifications, markAsOpened, openedNotificationIds, notificationsData } = useNotificationContext();
    const [activeTab, setActiveTab] = useState('all');

    const broadcasts = useMemo(() => {
        return notificationsData?.broadcasts || [];
    }, [notificationsData]);

    const undismissedBroadcasts = useMemo(() => {
        const dismissedId = localStorage.getItem('dismissedBroadcastId');
        return broadcasts.filter((b: any) => b._id !== dismissedId);
    }, [broadcasts]);

    const handleDismissBroadcast = (id: string) => {
        localStorage.setItem('dismissedBroadcastId', id);
        markAsOpened(id);
        refreshNotifications();
    };

    const tabs = [
        { id: 'all', label: 'All Activity', icon: ListBulletIcon, count: friendRequests.length + sharedNotes.length + undismissedBroadcasts.length },
        { id: 'announcements', label: 'Announcements', icon: MegaphoneIcon, count: undismissedBroadcasts.length },
        { id: 'shared', label: 'Shared Notes', icon: ShareIcon, count: sharedNotes.length },
        { id: 'requests', label: 'Friend Requests', icon: UserPlusIcon, count: friendRequests.length },
    ];

    const filteredContent = useMemo(() => {
        const content: any[] = [];

        if (activeTab === 'all' || activeTab === 'announcements') {
            undismissedBroadcasts.forEach(b => content.push({
                ...b,
                cardType: 'broadcast',
                sortDate: new Date(b.createdAt)
            }));
        }

        if (activeTab === 'all' || activeTab === 'requests') {
            friendRequests.forEach(r => content.push({
                ...r,
                cardType: 'request',
                sortDate: new Date(r.createdAt)
            }));
        }

        if (activeTab === 'all' || activeTab === 'shared') {
            sharedNotes.forEach(n => content.push({
                ...n,
                cardType: 'shared',
                sortDate: new Date(n.createdAt || Date.now())
            }));
        }

        return content.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());
    }, [activeTab, undismissedBroadcasts, friendRequests, sharedNotes]);

    const dismissError = () => dismissMessage('error');
    const dismissFeedbackMessage = () => dismissMessage('message');

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-12 animate-fade-slide-up">
            <FeedbackToasts
                error={error}
                message={message}
                isExitingError={isExitingError}
                isExitingMessage={isExitingMessage}
                dismissError={dismissError}
                dismissMessage={dismissFeedbackMessage}
            />

            <NotificationsHeader
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            <main className="space-y-6">
                <NotificationsList
                    content={filteredContent}
                    openedNotificationIds={openedNotificationIds}
                    onDismissBroadcast={handleDismissBroadcast}
                    onMarkAsOpened={markAsOpened}
                    onRespondToRequest={respondToFriendRequest}
                    refreshNotifications={refreshNotifications}
                    loading={loading}
                />
            </main>

            <footer className="pt-12 border-t border-gray-100 dark:border-white/5 flex flex-wrap items-center justify-center gap-10 opacity-60">
                <div className="flex items-center gap-3">
                    <ShieldCheckIcon className="w-5 h-5 text-emerald-500" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">End-to-End Encrypted</span>
                </div>
                <div className="flex items-center gap-3">
                    <SparklesIcon className="w-5 h-5 text-blue-500" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Secure & Private</span>
                </div>
            </footer>
        </div>
    );
}