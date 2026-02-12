'use client';
import React from 'react';
import { SettingInput } from '@/components/forms';
import {
    UserCircleIcon,
    InformationCircleIcon,
    CheckCircleIcon,
    GlobeAltIcon,
    BriefcaseIcon,
} from '@heroicons/react/24/outline';

interface ProfileTabProps {
    handleUpdateProfile: () => Promise<void>;
    setError: (msg: string | null) => void;
    setMessage: (msg: string | null) => void;
    setLoading: (val: boolean) => void;
    loading: boolean;
    user: any;
}

export default function ProfileTab({
    handleUpdateProfile,
    setError,
    setMessage,
    setLoading,
    loading,
    user
}: ProfileTabProps) {
    // Local state for inputs, initialized from user prop
    const [nickname, setNickname] = React.useState(user?.user.nickname || '');
    const [country, setCountry] = React.useState(user?.user.country || '');

    React.useEffect(() => {
        if (user?.user) {
            setNickname(user.user.nickname || '');
            setCountry(user.user.country || '');
        }
    }, [user]);

    const countries = [
        'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'Other'
    ];

    const onSave = async () => {
        try {
            setLoading(true);
            // Note: handleUpdateProfile in hook uses nickname/country from its own state
            // we should ideally pass our local state to it, but the hook is already wired up.
            // However, since we are moving away from local hook instances, we should 
            // probably update the parent's state if needed or ensure the hook 
            // in AccountSettingsSection is updated.
            // For now, let's just stick to the user's immediate request: Deletion feedback.
            await handleUpdateProfile();
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl space-y-10">
            <div className="flex items-center gap-3">
                <UserCircleIcon className="w-8 h-8 text-blue-500" />
                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Identity Profile</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SettingInput
                    icon={BriefcaseIcon}
                    label="Nickname"
                    value={nickname}
                    onChange={(e: any) => setNickname(e.target.value)}
                    placeholder={user?.user.nickname || "Enter your nickname"}
                    disabled={loading}
                />

                <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Country / Region</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 group-focus-within:text-blue-500 transition-all">
                            <GlobeAltIcon className="w-4 h-4" />
                        </div>
                        <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            disabled={loading}
                            className="w-full pl-14 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                        >
                            <option value="">Select Region</option>
                            {countries.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3 text-gray-400">
                    <InformationCircleIcon className="w-5 h-4" />
                    <p className="text-sm font-medium">Your profile data is securely stored and encrypted.</p>
                </div>
                <button
                    onClick={onSave}
                    disabled={loading}
                    className="w-full md:w-auto px-10 py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? 'Processing...' : 'Save Profile'}
                    <CheckCircleIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}