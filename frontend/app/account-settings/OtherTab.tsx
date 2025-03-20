'use client';
import React, { useState, useRef } from 'react';
import { useAccountSettingsLogic } from './accountSettingsLogic';
import { PhotoIcon, ChatBubbleLeftIcon, PaintBrushIcon, UserIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface OtherTabProps {
    handleUpdatePersonalization: () => Promise<void>;
}

export default function OtherTab({ handleUpdatePersonalization }: OtherTabProps) {
    const {
        user,
        avatar, setAvatar,
        header, setHeader,
        bio, setBio,
        gender, setGender,
        loading, message, error,
    } = useAccountSettingsLogic();
    const [activeSubTab, setActiveSubTab] = useState('appearance');
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const headerInputRef = useRef<HTMLInputElement>(null);

    const subTabs = [
        { name: 'appearance', label: 'Appearance', icon: PaintBrushIcon },
        { name: 'personal', label: 'Personal', icon: UserIcon },
    ];

    const handleFileChange = (setter: (file: File | null) => void, ref: React.RefObject<HTMLInputElement | null>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && !['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
            alert('Only JPEG, JPG, or PNG images are allowed');
            return;
        }
        setter(file || null);
    };

    const handleTextChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
        setter(e.target.value);
    };

    React.useEffect(() => {
        const resetFileInputs = () => {
            if (avatarInputRef.current) avatarInputRef.current.value = '';
            if (headerInputRef.current) headerInputRef.current.value = '';
        };
        window.addEventListener('resetFileInputs', resetFileInputs);
        return () => window.removeEventListener('resetFileInputs', resetFileInputs);
    }, []);

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
                            accept="image/jpeg,image/jpg,image/png"
                            ref={avatarInputRef}
                            onChange={handleFileChange(setAvatar, avatarInputRef)}
                            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                            disabled={loading}
                        />
                        {user?.user.avatar && <img src={user.user.avatar} alt="Avatar" className="mt-2 w-24 h-24 rounded" />}
                    </div>
                    <div>
                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                            <PhotoIcon className="w-5 h-5 mr-2" />
                            Header
                        </label>
                        <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png"
                            ref={headerInputRef}
                            onChange={handleFileChange(setHeader, headerInputRef)}
                            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                            disabled={loading}
                        />
                        {user?.user.header && <img src={user.user.header} alt="Header" className="mt-2 w-full h-32 object-cover rounded" />}
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
                            placeholder={user?.user.bio || 'Write something about yourself'}
                            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                            rows={4}
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                            <UserIcon className="w-5 h-5 mr-2" />
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
                    <button
                        onClick={handleUpdatePersonalization}
                        disabled={loading}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        {loading ? 'Saving...' : 'Save Personalization'}
                    </button>
                </div>
            )}
            {message && <p className="text-green-500 dark:text-green-400 text-sm mt-4">{message}</p>}
            {error && <p className="text-red-500 dark:text-red-400 text-sm mt-4">{error}</p>}
        </div>
    );
}