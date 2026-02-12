'use client';
import React, { useState } from 'react';
import { useAccountSettingsLogic } from '@/features/settings/hooks/useAccountSettings';
import ProfileTab from './ProfileTab';
import SecurityTab from './SecurityTab';
import OtherTab from './OtherTab';
import AdminIdentityTab from './AdminIdentityTab';
import {
    UserIcon,
    LockClosedIcon,
    CogIcon,
    CheckCircleIcon,
    XCircleIcon,
    XMarkIcon,
    ShieldCheckIcon,
    FingerPrintIcon,
    AdjustmentsHorizontalIcon,
    ArrowUpRightIcon,
    Squares2X2Icon,
    UsersIcon
} from '@heroicons/react/24/outline';

export default function AccountSettingsSection() {
    const {
        user,
        username,
        setUsername,
        newEmail,
        setNewEmail,
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        confirmNewPassword,
        setConfirmNewPassword,
        totpEnabled,
        totpQrCode,
        totpToken,
        setTotpToken,
        message,
        error,
        isExitingError,
        isExitingMessage,
        dismissMessage,
        handleUpdateProfile,
        handleUpdateUsername,
        handleChangeEmail,
        handleChangePassword,
        handleSetupTotp,
        handleVerifyTotp,
        handleDisableTotp,
        handleUpdatePersonalization,
        loading,
        setLoading,
        setError,
        setMessage
    } = useAccountSettingsLogic();

    const isAdmin = user?.user.role === 'admin' || user?.user.role === 'superadmin';
    const [activeTab, setActiveTab] = useState(isAdmin ? 'system' : 'profile');

    if (!user) return null;

    const tabs = isAdmin
        ? [
            { name: 'system', label: 'Account', icon: AdjustmentsHorizontalIcon },
            { name: 'security', label: 'Security', icon: ShieldCheckIcon },
        ]
        : [
            { name: 'profile', label: 'Identity', icon: UserIcon },
            { name: 'security', label: 'Security', icon: ShieldCheckIcon },
            { name: 'other', label: 'Preferences', icon: CogIcon },
        ];

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-10 animate-slide-up-fade">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        <CogIcon className="w-10 h-10 text-blue-500" />
                        Account Settings
                    </h2>
                    <p className="text-gray-500 dark:text-slate-400 font-medium mt-1">Manage your account profile, password, and security settings.</p>
                </div>

                <div className="flex bg-gray-100 dark:bg-white/5 p-1.5 rounded-[1.5rem] border border-gray-200 dark:border-white/10">
                    {tabs.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all active:scale-95 ${activeTab === tab.name
                                ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-white shadow-xl shadow-black/5 border border-gray-100 dark:border-white/10'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                <section className="lg:col-span-3 space-y-6">
                    <div className="animate-scale-in">
                        {activeTab === 'system' && (
                            <AdminIdentityTab
                                user={user}
                                username={username}
                                setUsername={setUsername}
                                loading={loading}
                                handleUpdatePersonalization={handleUpdatePersonalization}
                                handleUpdateUsername={handleUpdateUsername}
                                handleChangeEmail={handleChangeEmail}
                                newEmail={newEmail}
                                setNewEmail={setNewEmail}
                            />
                        )}
                        {activeTab === 'profile' && (
                            <ProfileTab
                                handleUpdateProfile={handleUpdateProfile}
                                setError={setError}
                                setMessage={setMessage}
                                setLoading={setLoading}
                                loading={loading}
                                user={user}
                            />
                        )}
                        {activeTab === 'security' && (
                            <SecurityTab
                                user={user}
                                isAdmin={isAdmin}
                                username={username}
                                setUsername={setUsername}
                                newEmail={newEmail}
                                setNewEmail={setNewEmail}
                                currentPassword={currentPassword}
                                setCurrentPassword={setCurrentPassword}
                                newPassword={newPassword}
                                setNewPassword={setNewPassword}
                                confirmNewPassword={confirmNewPassword}
                                setConfirmNewPassword={setConfirmNewPassword}
                                totpEnabled={totpEnabled}
                                totpQrCode={totpQrCode}
                                totpToken={totpToken}
                                setTotpToken={setTotpToken}
                                handleUpdateUsername={handleUpdateUsername}
                                handleChangeEmail={handleChangeEmail}
                                handleChangePassword={handleChangePassword}
                                handleSetupTotp={handleSetupTotp}
                                handleVerifyTotp={handleVerifyTotp}
                                handleDisableTotp={handleDisableTotp}
                                setError={setError}
                                setMessage={setMessage}
                                setLoading={setLoading}
                                loading={loading}
                            />
                        )}
                        {activeTab === 'other' && (
                            <OtherTab
                                handleUpdatePersonalization={handleUpdatePersonalization}
                                setMessage={setMessage}
                                setError={setError}
                                setLoading={setLoading}
                                loading={loading}
                                error={error}
                                user={user}
                            />
                        )}
                    </div>
                </section>

                <aside className="space-y-6">
                    <div
                        onClick={() => setActiveTab('security')}
                        className={`glass-premium p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl space-y-6 cursor-pointer hover:scale-[1.02] transition-all active:scale-95 ${(user.user.verified && user.user.isTotpEnabled) ? '' : 'ring-2 ring-amber-500/50'}`}
                        title={(user.user.verified && user.user.isTotpEnabled) ? 'Account secured' : 'Enhance your protection'}
                    >
                        <div className={`p-3 rounded-2xl w-fit ${(user.user.verified && user.user.isTotpEnabled) ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                            <ShieldCheckIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white">Security Status</h3>
                        <div className="space-y-4">
                            <div className="h-3 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-1000 ${(user.user.verified && user.user.isTotpEnabled) ? 'bg-emerald-500 w-full' : 'bg-amber-500 w-2/3'}`} />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-center" style={{ color: (user.user.verified && user.user.isTotpEnabled) ? '#10b981' : '#f59e0b' }}>
                                {(user.user.verified && user.user.isTotpEnabled) ? 'ENHANCED PROTECTION' : 'BASIC PROTECTION'}
                            </p>
                        </div>
                    </div>
                </aside>
            </main>

            {/* Floating Messages Area */}
            <div className="fixed top-24 right-4 z-[110] flex flex-col gap-3 pointer-events-none">
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

        </div>
    );
}