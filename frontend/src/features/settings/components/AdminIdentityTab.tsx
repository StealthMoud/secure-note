'use client';
import React from 'react';
import { SettingInput } from '@/components/forms';
import {
    IdentificationIcon,
    EnvelopeIcon,
    ShieldCheckIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    KeyIcon
} from '@heroicons/react/24/outline';

interface AdminIdentityTabProps {
    user: any;
    username: string;
    setUsername: (val: string) => void;
    loading: boolean;
    handleUpdateUsername: () => Promise<void>;
    handleChangeEmail: () => Promise<void>;
    newEmail: string;
    setNewEmail: (email: string) => void;
    handleUpdatePersonalization: () => Promise<void>;
}

export default function AdminIdentityTab({
    user,
    username,
    setUsername,
    loading,
    handleUpdateUsername,
    handleChangeEmail,
    newEmail,
    setNewEmail,
    handleUpdatePersonalization
}: AdminIdentityTabProps) {
    return (
        <div className="glass p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl space-y-10 animate-fadeInShort">
            <div className="flex flex-col md:flex-row md:items-center gap-8 p-6 rounded-[2rem] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-inner">
                <div className="relative group">
                    <div className={`w-36 h-36 rounded-full flex items-center justify-center transition-all duration-700 bg-white dark:bg-gray-900 border-2 ${user?.user.role === 'superadmin'
                        ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)] animate-orb-glow'
                        : 'border-slate-400 dark:border-slate-600'
                        }`}>
                        {user?.user.role === 'superadmin' ? (
                            <ShieldCheckIcon className="w-16 h-16 text-blue-500 animate-pulse-subtle" />
                        ) : (
                            <KeyIcon className="w-16 h-16 text-slate-400 dark:text-slate-600" />
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        {user?.user.role === 'superadmin' ? 'Super Admin' : 'System Admin'}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user?.user.role === 'superadmin'
                            ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                            : 'bg-slate-500/10 text-slate-600 border border-slate-500/20'
                            }`}>
                            Role Tier: {user?.user.role === 'superadmin' ? 'Level 3' : 'Level 2'}
                        </span>
                        <div className="px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                            Verified Status
                        </div>
                    </div>
                    <p className="text-sm text-gray-400 font-medium">This account acts as a functional authority node within the SecureNote infrastructure.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <SettingInput
                        icon={IdentificationIcon}
                        label="Username"
                        value={username}
                        onChange={(e: any) => setUsername(e.target.value)}
                        placeholder={user?.user.username}
                        disabled={loading}
                    />
                    <button
                        onClick={handleUpdateUsername}
                        disabled={loading}
                        className="w-full py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-widest shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        Update Username
                        <CheckCircleIcon className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-6">
                    <SettingInput
                        icon={EnvelopeIcon}
                        label="Email"
                        value={newEmail}
                        onChange={(e: any) => setNewEmail(e.target.value)}
                        placeholder={user?.user.email}
                        disabled={loading}
                    />
                    <button
                        onClick={handleChangeEmail}
                        disabled={loading}
                        className="w-full py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-widest shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        Update Email
                        <CheckCircleIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-white/5 flex items-center gap-3 text-gray-400">
                <InformationCircleIcon className="w-5 h-4 text-blue-500" />
                <p className="text-xs font-medium">Assigned Role: <span className="text-blue-500 font-black uppercase">{user?.user.role === 'superadmin' ? 'Super Admin' : 'System Admin'}</span></p>
            </div>
        </div>
    );
}
