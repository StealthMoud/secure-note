'use client';
import React from 'react';
import { useProfileLogic } from '@/features/profile/hooks/useProfile';
import { ProfileField } from '@/components/ui';
import {
    CameraIcon,
    InformationCircleIcon,
    UserIcon,
    EnvelopeIcon,
    FingerPrintIcon, // Fixed from FingerprintIcon
    CalendarDaysIcon,
    KeyIcon,
    BriefcaseIcon,
    GlobeAltIcon,
    SparklesIcon,
    XMarkIcon,
    XCircleIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function ProfileSection() {
    const {
        user,
        avatar,
        setAvatar,
        header,
        setHeader,
        handleUpdateAppearance,
        loading,
        message,
        error,
        dismissMessage,
        isExitingError,
        isExitingMessage
    } = useProfileLogic();

    if (!user) return null;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    // logic for previews or existing images
    const getAvatarUrl = () => {
        if (avatar instanceof File) return URL.createObjectURL(avatar);
        if (user.avatar) return `${backendUrl}${user.avatar}`;
        return null;
    };

    const getHeaderUrl = () => {
        if (header instanceof File) return URL.createObjectURL(header);
        if (user.header) return `${backendUrl}${user.header}`;
        return null;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'header') => {
        const file = e.target.files?.[0];
        if (file) {
            if (type === 'avatar') setAvatar(file);
            else setHeader(file);
        }
    };

    const avatarUrl = getAvatarUrl();
    const headerUrl = getHeaderUrl();

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-10 animate-slide-up-fade">
            {/* Floating Messages Area */}
            <div className="fixed top-24 right-4 z-50 flex flex-col gap-3 pointer-events-none">
                {error && (
                    <div
                        className={`pointer-events-auto bg-rose-500/10 backdrop-blur-md border border-rose-500/20 text-rose-600 dark:text-rose-400 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 transition-all duration-500 ${isExitingError ? 'opacity-0 translate-x-full' : 'animate-slide-in-right'}`}
                        role="alert"
                    >
                        <XCircleIcon className="w-6 h-6 shrink-0" />
                        <p className="font-bold">{error}</p>
                        <button onClick={() => dismissMessage('error')} className="ml-4 hover:opacity-70 transition-opacity">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}
                {message && (
                    <div
                        className={`pointer-events-auto bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 transition-all duration-500 ${isExitingMessage ? 'opacity-0 translate-x-full' : 'animate-slide-in-right'}`}
                        role="status"
                    >
                        <CheckCircleIcon className="w-6 h-6 shrink-0" />
                        <p className="font-bold">{message}</p>
                        <button onClick={() => dismissMessage('message')} className="ml-4 hover:opacity-70 transition-opacity">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>


            {/* profile header area */}
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

            <main className="max-w-4xl mx-auto mt-10">
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
            </main>

            <footer className="text-center py-10">
                <div className="inline-flex items-center gap-4 px-4 py-2 rounded-2xl bg-gray-50 dark:bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    <FingerPrintIcon className="w-4 h-4" />
                    Profile Secured by SecureNote
                </div>
            </footer>
        </div>
    );
}