'use client';

import React from 'react';
import { XMarkIcon, SparklesIcon, ClockIcon } from '@heroicons/react/24/outline';

interface NotificationCardProps {
    icon: React.ElementType;
    title: string;
    description: string;
    time: string;
    onAccept?: () => void;
    onReject?: () => void;
    onDismiss?: () => void;
    onOpen?: () => void;
    loading?: boolean;
    typeColor: string;
    isBroadcast?: boolean;
    isRead?: boolean;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
    icon: Icon,
    title,
    description,
    time,
    onAccept,
    onReject,
    onDismiss,
    onOpen,
    loading,
    typeColor,
    isBroadcast,
    isRead
}) => (
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
