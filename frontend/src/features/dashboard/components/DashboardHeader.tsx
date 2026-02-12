import React from 'react';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { User } from '@/types/user';

interface DashboardHeaderProps {
    user: User;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user }) => {
    return (
        <header className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-8 md:p-10 shadow-xl border border-gray-100 dark:border-white/5">
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 z-10">
                <div className="text-center md:text-left space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest">
                        <LockClosedIcon className="w-3.5 h-3.5" />
                        Personal Node
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                        Hi, <span className="text-blue-600 dark:text-blue-400">{user.username}</span>.
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg max-w-md mx-auto md:mx-0 font-medium leading-relaxed">
                        {user.verified
                            ? 'Your encryption keys are synced and your vault is ready.'
                            : 'Currently operating in lite mode. Verify your identity for full access.'}
                    </p>
                </div>

                <div className="flex items-center gap-6 p-1 pr-6 bg-gray-50 dark:bg-white/5 rounded-full border border-gray-100 dark:border-white/10">
                    <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-blue-500/20">
                        {user.username[0].toUpperCase()}
                    </div>
                    <div>
                        <p className="text-gray-900 dark:text-white font-black text-sm uppercase tracking-wide">{user.role}</p>
                        <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Account Tier</p>
                    </div>
                </div>
            </div>
        </header>
    );
};
