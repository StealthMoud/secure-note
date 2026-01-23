import { useEffect, useState, useMemo } from 'react';
import { useNotificationsLogic } from '@/features/notifications/hooks/useNotifications';
import { useDashboardSharedContext } from '@/context/DashboardSharedContext';
import api from '@/services/api';
import {
    BellIcon,
    CheckIcon,
    XMarkIcon,
    XCircleIcon,
    CheckCircleIcon,
    UserPlusIcon,
    ShareIcon,
    ShieldCheckIcon,
    SparklesIcon,
    InformationCircleIcon,
    EnvelopeOpenIcon,
    ClockIcon,
    MegaphoneIcon,
    ListBulletIcon
} from '@heroicons/react/24/outline';

const NotificationCard = ({ icon: Icon, title, description, time, onAccept, onReject, onDismiss, onOpen, loading, typeColor, isBroadcast, isRead }: any) => (
    <div
        onClick={onOpen}
        className={`glass p-8 rounded-[2.5rem] border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 group hover:scale-[1.01] transition-all shadow-2xl relative overflow-hidden cursor-pointer ${!isRead ? 'border-blue-500/30 ring-1 ring-blue-500/20' : ''}`}
    >
        {!isRead && (
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
        )}
        {isBroadcast && onDismiss && (
            <button
                onClick={(e) => { e.stopPropagation(); onDismiss(); }}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all active:scale-95 z-10"
                title="Dismiss"
            >
                <XMarkIcon className="w-5 h-5 text-gray-400" />
            </button>
        )}
        <div className="flex items-center gap-8 flex-1 w-full relative">
            {!isRead && (
                <div className="absolute -top-4 -left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-600 text-[8px] font-black text-white uppercase tracking-widest shadow-lg shadow-blue-500/30 animate-pulse">
                    <SparklesIcon className="w-3 h-3" />
                    New
                </div>
            )}
            <div className={`p-5 rounded-2xl ${typeColor} glass border-white/20 shadow-xl group-hover:rotate-12 transition-transform shrink-0`}>
                <Icon className="w-8 h-8" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                    <p className="text-xl font-black text-gray-900 dark:text-white tracking-tight italic truncate">{title}</p>
                    <span className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-3 py-1 rounded-full glass border-white/10 w-fit">
                        <ClockIcon className="w-3.5 h-3.5" />
                        {time}
                    </span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-xl break-words">{description}</p>
            </div>
        </div>

        {onAccept && onReject && (
            <div className="flex gap-4 w-full md:w-auto mt-4 md:mt-0 relative z-10">
                <button
                    onClick={(e) => { e.stopPropagation(); onAccept(); }}
                    disabled={loading}
                    className="flex-1 md:flex-none px-8 py-4 rounded-2xl bg-emerald-500 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all active:scale-95 shadow-xl shadow-emerald-500/20 disabled:opacity-30"
                >
                    Accept
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onReject(); }}
                    disabled={loading}
                    className="flex-1 md:flex-none px-8 py-4 rounded-2xl glass border-white/20 text-gray-400 font-black text-xs uppercase tracking-[0.2em] hover:text-rose-500 transition-all active:scale-95 disabled:opacity-30"
                >
                    Reject
                </button>
            </div>
        )}
    </div>
);

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

    const { refreshNotifications, markAsOpened, openedNotificationIds, notificationsData } = useDashboardSharedContext();
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

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-12 animate-fade-slide-up">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-gray-100 dark:border-white/5">
                <div>
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.4em] mb-2 text-center md:text-left">Activity Log</h3>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter italic flex items-center justify-center md:justify-start gap-4">
                        Your <span className="text-blue-600">Notifications</span>
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mt-3 max-w-md text-center md:text-left">Real-time updates on your notes and connections.</p>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 p-1.5 glass rounded-[2rem] border-white/10">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 active:scale-95'
                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`ml-1 px-2 py-0.5 rounded-md text-[8px] ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </header>

            <main className="space-y-6">
                {filteredContent.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center glass rounded-[3.5rem] border-white/10 shadow-2xl">
                        <div className="p-10 rounded-3xl glass border-white/10 mb-8 shadow-inner animate-pulse-subtle">
                            <EnvelopeOpenIcon className="w-20 h-20 text-gray-300 dark:text-gray-700" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight italic">No Notifications</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mt-3 font-medium">You're all caught up in this category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredContent.map((item) => {
                            const isRead = openedNotificationIds.includes(item._id);

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
                                        key={item._id}
                                        icon={Icon}
                                        title="System Announcement"
                                        description={item.message}
                                        time={new Date(item.createdAt).toLocaleDateString()}
                                        onDismiss={() => handleDismissBroadcast(item._id)}
                                        onOpen={() => markAsOpened(item._id)}
                                        typeColor={typeColor}
                                        isBroadcast={true}
                                        isRead={isRead}
                                    />
                                );
                            }

                            if (item.cardType === 'request') {
                                return (
                                    <NotificationCard
                                        key={item._id}
                                        icon={UserPlusIcon}
                                        title="New Friend Request"
                                        description={`${item.sender.username} sent you a friend request.`}
                                        time={new Date(item.createdAt).toLocaleDateString()}
                                        onAccept={() => {
                                            markAsOpened(item._id);
                                            respondToFriendRequest(item._id, 'accept').then(() => refreshNotifications());
                                        }}
                                        onReject={() => {
                                            markAsOpened(item._id);
                                            respondToFriendRequest(item._id, 'reject').then(() => refreshNotifications());
                                        }}
                                        onOpen={() => markAsOpened(item._id)}
                                        loading={loading}
                                        isRead={isRead}
                                        typeColor="text-blue-500"
                                    />
                                );
                            }

                            if (item.cardType === 'shared') {
                                return (
                                    <NotificationCard
                                        key={item._id}
                                        icon={ShareIcon}
                                        title="Note Shared With You"
                                        description={`You've been given access to: "${item.title}".`}
                                        time={new Date(item.createdAt || '').toLocaleDateString()}
                                        onOpen={() => markAsOpened(item._id)}
                                        isRead={isRead}
                                        typeColor="text-indigo-500"
                                    />
                                );
                            }

                            return null;
                        })}
                    </div>
                )}
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
            {/* Floating Messages Area */}
            <div className="fixed top-24 right-4 z-50 flex flex-col gap-3 pointer-events-none">
                {error && (
                    <div
                        className={`pointer-events-auto bg-rose-500/10 backdrop-blur-md border border-rose-500/20 text-rose-600 dark:text-rose-400 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 transition-all duration-500 ${isExitingError ? 'opacity-0 translate-x-full' : 'animate-slide-in-right'}`}
                        role="alert"
                    >
                        <XCircleIcon className="w-6 h-6 shrink-0" />
                        <p className="font-bold">{error}</p>
                        <button onClick={() => dismissMessage('error')} className="ml-4 hover:opacity-70 transition-opacity">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}
                {message && (
                    <div
                        className={`pointer-events-auto bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 transition-all duration-500 ${isExitingMessage ? 'opacity-0 translate-x-full' : 'animate-slide-in-right'}`}
                        role="status"
                    >
                        <CheckCircleIcon className="w-6 h-6 shrink-0" />
                        <p className="font-bold">{message}</p>
                        <button onClick={() => dismissMessage('message')} className="ml-4 hover:opacity-70 transition-opacity">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}