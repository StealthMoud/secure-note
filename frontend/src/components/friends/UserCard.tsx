'use client';

import React from 'react';

interface UserCardProps {
    username: string;
    status: string;
    onAction?: () => void;
    actionIcon?: React.ElementType;
    actionLabel?: string;
    actionColor?: string;
}

export const UserCard: React.FC<UserCardProps> = ({
    username,
    status,
    onAction,
    actionIcon: ActionIcon,
    actionLabel,
    actionColor
}) => (
    <div className="glass p-4 rounded-2xl flex items-center justify-between group hover:scale-[1.02] transition-all hover:shadow-xl border border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-4">
            <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center font-bold text-gray-500 dark:text-gray-400">
                    {username[0].toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />
            </div>
            <div>
                <p className="font-black text-gray-900 dark:text-white">{username}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{status}</p>
            </div>
        </div>
        {onAction && ActionIcon && (
            <button
                onClick={onAction}
                className={`p-2 rounded-xl border border-gray-100 dark:border-white/10 hover:bg-${actionColor}-500 hover:text-white transition-all active:scale-95 group-hover:shadow-lg`}
                title={actionLabel}
            >
                <ActionIcon className="w-5 h-5" />
            </button>
        )}
    </div>
);
