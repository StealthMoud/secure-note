'use client';
import React from 'react';
import { useAccountSettingsLogic } from './accountSettingsLogic';
import { ChatBubbleLeftIcon, UserIcon, CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface OtherTabProps {
    handleUpdatePersonalization: () => Promise<void>;
}

export default function OtherTab({ handleUpdatePersonalization }: OtherTabProps) {
    const {
        user,
        bio,
        setBio,
        gender,
        setGender,
        loading,
        message,
        error,
        isExitingError,
        isExitingMessage,
        dismissMessage,
    } = useAccountSettingsLogic();

    const handleTextChange = (setter: (value: string) => void) => (
        e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setter(e.target.value);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-500 ease-in-out transform hover:scale-105 hover:rotate-x-1 hover:rotate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] perspective-[1000px] animate-fadeInShort">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <UserIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                Personal
            </h3>
            <div className="space-y-4">
                <div>
                    <label className="flex items-center text-gray-700 dark:text-gray-300">
                        <ChatBubbleLeftIcon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                        Bio
                    </label>
                    <div className="relative">
                        <ChatBubbleLeftIcon className="absolute left-3 top-3 h-5 w-5 text-gray-600 dark:text-gray-400 pointer-events-none" />
                        <textarea
                            value={bio}
                            onChange={handleTextChange(setBio)}
                            placeholder={user?.user.bio || 'Write something about yourself'}
                            className="mt-1 w-full pl-10 p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition duration-200"
                            rows={4}
                            disabled={loading}
                            aria-label="Bio"
                        />
                    </div>
                </div>
                <div>
                    <label className="flex items-center text-gray-700 dark:text-gray-300">
                        <UserIcon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                        Gender
                    </label>
                    <select
                        value={gender}
                        onChange={handleTextChange(setGender)}
                        className="mt-1 w-full p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition duration-200"
                        disabled={loading}
                        aria-label="Gender"
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
                    className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 transition-all duration-500 ease-in-out transform hover:scale-105 active:scale-95 flex items-center ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    aria-label="Save personalization"
                >
                    {loading ? (
                        <svg
                            className="animate-spin h-5 w-5 mr-2 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                    ) : (
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                    )}
                    {loading ? 'Saving...' : 'Save Personalization'}
                </button>
            </div>
            {error && (
                <p
                    className={`bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-sm p-2 rounded-md flex items-center transition-opacity duration-500 ${
                        isExitingError ? 'opacity-0' : 'opacity-100 animate-fadeInShort'
                    }`}
                >
                    <XCircleIcon className="h-5 w-5 mr-2 text-red-800 dark:text-red-200" />
                    {error}
                    <button onClick={() => dismissMessage('error')} className="ml-auto">
                        <XMarkIcon className="h-5 w-5 text-red-800 dark:text-red-200" />
                    </button>
                </p>
            )}
            {message && (
                <p
                    className={`bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm p-2 rounded-md flex items-center transition-opacity duration-500 ${
                        isExitingMessage ? 'opacity-0' : 'opacity-100 animate-fadeInShort'
                    }`}
                >
                    <CheckCircleIcon className="h-5 w-5 mr-2 text-green-800 dark:text-green-200" />
                    {message}
                    <button onClick={() => dismissMessage('message')} className="ml-auto">
                        <XMarkIcon className="h-5 w-5 text-green-800 dark:text-green-200" />
                    </button>
                </p>
            )}
        </div>
    );
}