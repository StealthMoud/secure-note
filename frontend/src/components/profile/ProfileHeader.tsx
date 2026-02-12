'use client';

import React from 'react';
import { CameraIcon, GlobeAltIcon, FingerPrintIcon } from '@heroicons/react/24/outline';

interface User {
    username: string;
    nickname?: string;
    avatar?: string;
    header?: string;
}

interface ProfileHeaderProps {
    user: User;
    avatar: string | File | undefined;
    header: string | File | undefined;
    avatarUrl: string | null;
    headerUrl: string | null;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'header') => void;
    handleUpdateAppearance: () => void;
    loading: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    user,
    avatar,
    header,
    avatarUrl,
    headerUrl,
    handleFileChange,
    handleUpdateAppearance,
    loading,
}) => {
    return (
        <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-white/5 group">
            <div className="h-64 md:h-80 bg-gradient-to-br from-slate-900 to-indigo-900 relative">
                {headerUrl ? (
                    <img src={headerUrl} alt="Header" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <GlobeAltIcon className="w-32 h-32 text-white/5" />
                    </div>
                )}

                <label className="absolute top-6 right-6 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white cursor-pointer hover:bg-white/20 transition-all active:scale-95">
                    <CameraIcon className="w-6 h-6" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'header')} disabled={loading} />
                </label>
            </div>

            <div className="px-8 pb-8 flex flex-col items-center md:items-start text-center md:text-left gap-6 -mt-20 relative">
                <div className="relative group/avatar">
                    <div className="w-40 h-40 rounded-full ring-8 ring-white dark:ring-gray-900 overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-2xl relative">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-5xl font-black text-gray-300 dark:text-gray-600">
                                {user.username[0].toUpperCase()}
                            </div>
                        )}
                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                            <CameraIcon className="w-8 h-8 text-white" />
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} disabled={loading} />
                        </label>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-emerald-500 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center text-white shadow-lg">
                        <FingerPrintIcon className="w-5 h-5" />
                    </div>
                </div>

                <div className="space-y-4 flex-1 pt-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between w-full">
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-4 justify-center md:justify-start">
                                {user.username}
                            </h1>
                            <p className="text-lg text-gray-500 dark:text-slate-400 font-medium text-center md:text-left">
                                {user.nickname || `@${user.username.toLowerCase()}`}
                            </p>
                        </div>
                        {(avatar instanceof File || header instanceof File) && (
                            <button
                                onClick={handleUpdateAppearance}
                                disabled={loading}
                                className="px-8 py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-500/20 disabled:opacity-50"
                            >
                                {loading ? 'Saving Changes...' : 'Save Appearance'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
