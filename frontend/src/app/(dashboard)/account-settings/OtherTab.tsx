'use client';
import React from 'react';
import { useAccountSettingsLogic } from '@/features/settings/hooks/useAccountSettings';
import {
    ChatBubbleLeftEllipsisIcon, // Fixed from ChatBubbleLeftIcon
    UserIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    SparklesIcon,
    FingerPrintIcon
} from '@heroicons/react/24/outline';

export default function OtherTab({ handleUpdatePersonalization }: { handleUpdatePersonalization: () => Promise<void> }) {
    const {
        user,
        bio,
        setBio,
        gender,
        setGender,
        loading,
    } = useAccountSettingsLogic();

    return (
        <div className="glass p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl space-y-10">
            <div className="flex items-center gap-3">
                <SparklesIcon className="w-8 h-8 text-blue-500" />
                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Personal Preferences</h3>
            </div>

            <div className="space-y-8">
                <div className="space-y-3">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">About Me</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-4 text-gray-400 group-focus-within:text-blue-500 transition-all">
                            <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />
                        </div>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder={user?.user.bio || "Tell us about yourself..."}
                            rows={5}
                            disabled={loading}
                            className="w-full pl-14 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white font-bold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 resize-none"
                        />
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium ml-1">This bio will be visible to your trusted connections.</p>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Gender Identity</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-all">
                            <UserIcon className="w-5 h-5" />
                        </div>
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            disabled={loading}
                            className="w-full pl-14 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3 text-gray-400">
                    <FingerPrintIcon className="w-5 h-4" />
                    <p className="text-sm font-medium">Personalization settings are encrypted at rest.</p>
                </div>
                <button
                    onClick={handleUpdatePersonalization}
                    disabled={loading}
                    className="w-full md:w-auto px-10 py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? 'Processing...' : 'Save Preferences'}
                    <CheckCircleIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}