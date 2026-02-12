import React from 'react';
import {
    UserIcon,
    EnvelopeIcon,
    CalendarIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { User } from '@/types/user';

interface IdentityProfileProps {
    user: User;
}

export const IdentityProfile: React.FC<IdentityProfileProps> = ({ user }) => {
    return (
        <div className="glass p-8 rounded-2xl border border-gray-100 dark:border-white/5 shadow-xl">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center tracking-tight">
                    <UserIcon className="w-6 h-6 mr-3 text-blue-500" />
                    Identity Profile
                </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600">
                            <EnvelopeIcon className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white break-all">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600">
                            <CalendarIcon className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Joined</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {new Date(user.createdAt || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-600">
                            <InformationCircleIcon className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Personal Bio</p>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed italic">
                                {user.bio || 'no encrypted bio set yet'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
