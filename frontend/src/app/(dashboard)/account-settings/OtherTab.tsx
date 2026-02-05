'use client';
import React from 'react';
import { useAccountSettingsLogic } from '@/features/settings/hooks/useAccountSettings';
import {
    ChatBubbleLeftEllipsisIcon,
    UserIcon,
    CheckCircleIcon,
    SparklesIcon,
    FingerPrintIcon,
    TrashIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import DeleteAccountModal from './DeleteAccountModal';
import { deleteAccount } from '@/services/users';
import { useRouter } from 'next/navigation';

export default function OtherTab({
    handleUpdatePersonalization,
    setMessage,
    setError,
    setLoading,
    loading,
    error,
    user
}: {
    handleUpdatePersonalization: () => Promise<void>,
    setMessage: (msg: string | null) => void,
    setError: (msg: string | null) => void,
    setLoading: (loading: boolean) => void,
    loading: boolean,
    error: string | null,
    user: any
}) {
    const [bio, setBio] = React.useState(user?.user.bio || '');
    const [gender, setGender] = React.useState(user?.user.gender || 'prefer-not-to-say');

    // update local state when user prop changes
    React.useEffect(() => {
        if (user?.user) {
            setBio(user.user.bio || '');
            setGender(user.user.gender || 'prefer-not-to-say');
        }
    }, [user]);

    const router = useRouter();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

    const handleDeleteAccount = async (password: string) => {
        try {
            setLoading(true);
            const res = await deleteAccount(password);
            setMessage(res.message);
            setIsDeleteModalOpen(false);

            // clear authentication and redirect after success
            setTimeout(() => {
                localStorage.removeItem('token');
                router.push('/');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to delete account');
        } finally {
            setLoading(false);
        }
    };

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

            {/* Danger Zone per GDPR requirements */}
            <div className="pt-10 border-t border-rose-500/10">
                <div className="bg-rose-500/5 rounded-3xl p-8 border border-rose-500/10 space-y-6">
                    <div className="flex items-center gap-3 text-rose-500">
                        <ExclamationTriangleIcon className="w-6 h-6" />
                        <h4 className="text-lg font-black uppercase tracking-tight">Danger Zone</h4>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <p className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-xs">Delete Account Permanently</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-md">
                                Once deleted, your account and all its data (notes, profile, images) are permanently purged and cannot be recovered.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="w-full md:w-auto px-8 py-3.5 rounded-xl border-2 border-rose-500/20 text-rose-500 font-black hover:bg-rose-500 hover:text-white transition-all active:scale-95 text-xs uppercase tracking-widest flex items-center justify-center gap-2 group"
                        >
                            <TrashIcon className="w-4 h-4 group-hover:animate-bounce" />
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>

            <DeleteAccountModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteAccount}
                loading={loading}
                error={error}
                hasPassword={!user?.user.githubId && !user?.user.googleId} // require password if not pure oauth
            />
        </div>
    );
}