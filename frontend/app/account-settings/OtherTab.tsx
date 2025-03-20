'use client';
import React from 'react';
import { useAccountSettingsLogic } from './accountSettingsLogic';
import { ChatBubbleLeftIcon, UserIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface OtherTabProps {
    handleUpdatePersonalization: () => Promise<void>;
}

export default function OtherTab({ handleUpdatePersonalization }: OtherTabProps) {
    const {
        user,
        bio, setBio,
        gender, setGender,
        loading, message, error,
    } = useAccountSettingsLogic();

    const handleTextChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
        setter(e.target.value);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Personal</h3>
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
            {message && <p className="text-green-500 dark:text-green-400 text-sm mt-4">{message}</p>}
            {error && <p className="text-red-500 dark:text-red-400 text-sm mt-4">{error}</p>}
        </div>
    );
}