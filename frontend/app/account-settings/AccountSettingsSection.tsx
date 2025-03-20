'use client';
import React, { useState } from 'react';
import { useAccountSettingsLogic } from './accountSettingsLogic';
import ProfileTab from './ProfileTab';
import SecurityTab from './SecurityTab';
import OtherTab from './OtherTab';
import { UserIcon, LockClosedIcon, CogIcon } from '@heroicons/react/24/outline';

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
        handleUpdateProfile,
        handleUpdateUsername,
        handleChangeEmail,
        handleChangePassword,
        handleSetupTotp,
        handleVerifyTotp,
        handleDisableTotp,
        handleUpdatePersonalization,
        loading,
    } = useAccountSettingsLogic();
    const [activeTab, setActiveTab] = useState('profile');

    if (!user) return null;

    const tabs = [
        { name: 'profile', label: 'Profile', icon: UserIcon },
        { name: 'security', label: 'Security', icon: LockClosedIcon },
        { name: 'other', label: 'Other', icon: CogIcon },
    ];

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center mb-6">
                <UserIcon className="w-8 h-8 mr-2 text-gray-700 dark:text-gray-300" />
                Account Settings
            </h2>
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                {tabs.map((tab) => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`flex items-center px-4 py-2 text-sm font-medium ${
                            activeTab === tab.name
                                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    >
                        <tab.icon className="w-5 h-5 mr-2" />
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="mt-6">
                {activeTab === 'profile' && <ProfileTab handleUpdateProfile={handleUpdateProfile} />}
                {activeTab === 'security' && (
                    <SecurityTab
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
                        loading={loading}
                        message={message}
                        error={error}
                    />
                )}
                {activeTab === 'other' && <OtherTab handleUpdatePersonalization={handleUpdatePersonalization} />}
            </div>
            {message && <p className="text-green-500 dark:text-green-400 text-sm mt-4">{message}</p>}
            {error && <p className="text-red-500 dark:text-red-400 text-sm mt-4">{error}</p>}
        </div>
    );
}