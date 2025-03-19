'use client';
import React, { useState, Dispatch, SetStateAction } from 'react';
import { useAccountSettingsLogic } from './accountSettingsLogic';
import { PencilIcon, UserCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

export default function ProfileTab({ setIsDirty }: { setIsDirty: Dispatch<SetStateAction<boolean>> }) {
    const {
        user,
        firstName, setFirstName,
        lastName, setLastName,
        nickname, setNickname,
        birthday, setBirthday,
        country, setCountry,
        loading,
    } = useAccountSettingsLogic();
    const [activeSubTab, setActiveSubTab] = useState('basic');

    const subTabs = [
        { name: 'basic', label: 'Basic Info', icon: UserCircleIcon },
        { name: 'account', label: 'Account Info', icon: InformationCircleIcon },
    ];

    const handleChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(e.target.value);
        setIsDirty(true);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                {subTabs.map((tab) => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveSubTab(tab.name)}
                        className={`flex items-center px-3 py-2 text-sm font-medium ${
                            activeSubTab === tab.name
                                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    >
                        <tab.icon className="w-5 h-5 mr-2" />
                        {tab.label}
                    </button>
                ))}
            </div>
            {activeSubTab === 'basic' && (
                <div className="space-y-4">
                    <div>
                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                            <PencilIcon className="w-5 h-5 mr-2" />
                            First Name
                        </label>
                        <input
                            value={firstName}
                            onChange={handleChange(setFirstName)}
                            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                            <PencilIcon className="w-5 h-5 mr-2" />
                            Last Name
                        </label>
                        <input
                            value={lastName}
                            onChange={handleChange(setLastName)}
                            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                            <PencilIcon className="w-5 h-5 mr-2" />
                            Nickname
                        </label>
                        <input
                            value={nickname}
                            onChange={handleChange(setNickname)}
                            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                            <PencilIcon className="w-5 h-5 mr-2" />
                            Birthday
                        </label>
                        <input
                            type="date"
                            value={birthday}
                            onChange={handleChange(setBirthday)}
                            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                            <PencilIcon className="w-5 h-5 mr-2" />
                            Country
                        </label>
                        <input
                            value={country}
                            onChange={handleChange(setCountry)}
                            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                            disabled={loading}
                        />
                    </div>
                </div>
            )}
            {activeSubTab === 'account' && (
                <div className="space-y-4">
                    <div>
                        <label className="text-gray-700 dark:text-gray-300">Username</label>
                        <p className="mt-1 text-gray-900 dark:text-gray-200">{user?.user.username}</p>
                    </div>
                    <div>
                        <label className="text-gray-700 dark:text-gray-300">Email</label>
                        <p className="mt-1 text-gray-900 dark:text-gray-200">{user?.user.email}</p>
                    </div>
                </div>
            )}
        </div>
    );
}