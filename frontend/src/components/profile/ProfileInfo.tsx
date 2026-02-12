'use client';

import React from 'react';
import {
    InformationCircleIcon,
    UserIcon,
    EnvelopeIcon,
    GlobeAltIcon,
    CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { ProfileField } from '@/components/ui';

interface User {
    username: string;
    email: string;
    country?: string;
    createdAt?: string;
    bio?: string;
}

interface ProfileInfoProps {
    user: User;
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({ user }) => {
    return (
        <section className="space-y-10">
            <div className="glass p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                    <InformationCircleIcon className="w-8 h-8 text-blue-500" />
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight text-center md:text-left">Profile Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ProfileField icon={UserIcon} label="Username" value={`@${user.username}`} color="text-blue-500" />
                    <ProfileField icon={EnvelopeIcon} label="Email Address" value={user.email} color="text-indigo-500" />
                    <ProfileField icon={GlobeAltIcon} label="Country" value={user.country || "Secure Domain"} color="text-amber-500" />
                    <ProfileField icon={CalendarDaysIcon} label="Member Since" value={new Date(user.createdAt || '').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} color="text-emerald-500" />
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">About Me</p>
                    <p className="text-gray-600 dark:text-slate-300 font-medium leading-relaxed bg-gray-50 dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-white/10">
                        {user.bio || "This user hasn't shared a bio yet."}
                    </p>
                </div>
            </div>
        </section>
    );
};
