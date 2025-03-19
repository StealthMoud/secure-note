'use client';
import React, { useState, Dispatch, SetStateAction } from 'react';
import { useAccountSettingsLogic } from './accountSettingsLogic';
import { PhotoIcon, ChatBubbleLeftIcon, PaintBrushIcon, UserIcon } from '@heroicons/react/24/outline';

export default function OtherTab({ setIsDirty }: { setIsDirty: Dispatch<SetStateAction<boolean>> }) {
    const {
        avatar, setAvatar,
        header, setHeader,
        bio, setBio,
        gender, setGender,
        loading,
    } = useAccountSettingsLogic();
    const [activeSubTab, setActiveSubTab] = useState('appearance');

    const subTabs = [
        { name: 'appearance', label: 'Appearance', icon: PaintBrushIcon },
        { name: 'personal', label: 'Personal', icon: UserIcon },
    ];

    const handleFileChange = (setter: (file: File | null) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(e.target.files?.[0] || null);
        setIsDirty(true);
    };

    const handleTextChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
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
            {activeSubTab === 'appearance' && (
                <div className="space-y-4">
                    <div>
                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                            <PhotoIcon className="w-5 h-5 mr-2" />
                            Avatar
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange(setAvatar)}
                            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                            <PhotoIcon className="w-5 h-5 mr-2" />
                            Header
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange(setHeader)}
                            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                            disabled={loading}
                        />
                    </div>
                </div>
            )}
            {activeSubTab === 'personal' && (
                <div className="space-y-4">
                    <div>
                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                            <ChatBubbleLeftIcon className="w-5 h-5 mr-2" />
                            Bio
                        </label>
                        <textarea
                            value={bio}
                            onChange={handleTextChange(setBio)}
                            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                            rows={4}
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                            Gender
                        </label>
                        <select
                            value={gender}
                            onChange={handleTextChange(setGender)}
                            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                            disabled={loading}
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
}