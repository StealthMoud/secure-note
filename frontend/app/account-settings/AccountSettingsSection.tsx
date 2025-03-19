'use client';
import React, { useState } from 'react';
import { useAccountSettingsLogic } from './accountSettingsLogic';
import ProfileTab from './ProfileTab';
import SecurityTab from './SecurityTab';
import OtherTab from './OtherTab';
import { UserIcon, LockClosedIcon, CogIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function AccountSettingsSection() {
    const {
        user,
        message,
        error,
        handleUpdateProfile,
        handleUpdateUsername,
        handleChangeEmail,
        handleChangePassword,
        handleUpdatePersonalization,
        loading
    } = useAccountSettingsLogic();
    const [activeTab, setActiveTab] = useState('profile');
    const [isDirty, setIsDirty] = useState(false); // Track if any changes are made

    if (!user) return null;

    const tabs = [
        { name: 'profile', label: 'Profile', icon: UserIcon },
        { name: 'security', label: 'Security', icon: LockClosedIcon },
        { name: 'other', label: 'Other', icon: CogIcon },
    ];

    const handleSaveAll = async () => {
        if (loading) return;
        try {
            await Promise.all([
                handleUpdateProfile(),
                handleUpdateUsername(),
                handleChangeEmail(),
                !user.user.githubId && handleChangePassword(), // Skip if OAuth
                handleUpdatePersonalization(),
            ].filter(Boolean));
            setIsDirty(false);
        } catch (err) {
            console.error('Save all failed:', err);
        }
    };

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
                {activeTab === 'profile' && <ProfileTab setIsDirty={setIsDirty} />}
                {activeTab === 'security' && <SecurityTab setIsDirty={setIsDirty} />}
                {activeTab === 'other' && <OtherTab setIsDirty={setIsDirty} />}
            </div>
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleSaveAll}
                    disabled={loading || !isDirty}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    {loading ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>
            {message && <p className="text-green-500 dark:text-green-400 text-sm mt-4">{message}</p>}
            {error && <p className="text-red-500 dark:text-red-400 text-sm mt-4">{error}</p>}
        </div>
    );
}