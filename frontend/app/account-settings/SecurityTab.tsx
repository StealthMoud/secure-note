'use client';
import React, { useState, Dispatch, SetStateAction } from 'react';
import {
    PencilIcon,
    EnvelopeIcon,
    LockClosedIcon,
    KeyIcon,
    ShieldCheckIcon,
    CheckCircleIcon,
    XCircleIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAccountSettingsLogic } from './accountSettingsLogic';

interface SecurityTabProps {
    username: string;
    setUsername: Dispatch<SetStateAction<string>>;
    newEmail: string;
    setNewEmail: Dispatch<SetStateAction<string>>;
    currentPassword: string;
    setCurrentPassword: Dispatch<SetStateAction<string>>;
    newPassword: string;
    setNewPassword: Dispatch<SetStateAction<string>>;
    confirmNewPassword: string;
    setConfirmNewPassword: Dispatch<SetStateAction<string>>;
    totpEnabled: boolean;
    totpQrCode: string | null;
    totpToken: string;
    setTotpToken: Dispatch<SetStateAction<string>>;
    handleUpdateUsername: () => Promise<void>;
    handleChangeEmail: () => Promise<void>;
    handleChangePassword: () => Promise<void>;
    handleSetupTotp: () => Promise<void>;
    handleVerifyTotp: () => Promise<void>;
    handleDisableTotp: () => Promise<void>;
    loading: boolean;
}

export default function SecurityTab({
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
                                        handleUpdateUsername,
                                        handleChangeEmail,
                                        handleChangePassword,
                                        handleSetupTotp,
                                        handleVerifyTotp,
                                        handleDisableTotp,
                                        loading,
                                    }: SecurityTabProps) {
    const { message, error, isExitingError, isExitingMessage, dismissMessage } = useAccountSettingsLogic();
    const [activeSubTab, setActiveSubTab] = useState('username');

    const subTabs = [
        { name: 'username', label: 'Username', icon: PencilIcon },
        { name: 'email', label: 'Email', icon: EnvelopeIcon },
        { name: 'password', label: 'Password', icon: LockClosedIcon },
        { name: '2fa', label: '2FA', icon: ShieldCheckIcon },
    ];

    const handleChange = (setter: (value: string) => void) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setter(e.target.value);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-500 ease-in-out transform hover:scale-105 hover:rotate-x-1 hover:rotate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] perspective-[1000px] animate-fadeInShort">
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                {subTabs.map((tab) => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveSubTab(tab.name)}
                        className={`flex items-center px-3 py-2 text-sm font-medium transition-all duration-500 ease-in-out transform hover:scale-105 ${
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
            {activeSubTab === 'username' && (
                <div className="space-y-4">
                    <div>
                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                            <PencilIcon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                            Username
                        </label>
                        <div className="relative">
                            <PencilIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600 dark:text-gray-400 pointer-events-none" />
                            <input
                                value={username}
                                onChange={handleChange(setUsername)}
                                placeholder="Enter new username"
                                className="mt-1 w-full pl-10 p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition duration-200"
                                disabled={loading}
                                aria-label="Username"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleUpdateUsername}
                        disabled={loading}
                        className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 transition-all duration-500 ease-in-out transform hover:scale-105 active:scale-95 flex items-center ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        aria-label="Save username"
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
                        {loading ? 'Saving...' : 'Save Username'}
                    </button>
                </div>
            )}
            {activeSubTab === 'email' && (
                <div className="space-y-4">
                    <div>
                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                            <EnvelopeIcon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                            New Email
                        </label>
                        <div className="relative">
                            <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600 dark:text-gray-400 pointer-events-none" />
                            <input
                                value={newEmail}
                                onChange={handleChange(setNewEmail)}
                                placeholder="Enter new email"
                                className="mt-1 w-full pl-10 p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition duration-200"
                                disabled={loading}
                                aria-label="New email"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleChangeEmail}
                        disabled={loading}
                        className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 transition-all duration-500 ease-in-out transform hover:scale-105 active:scale-95 flex items-center ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        aria-label="Save email"
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
                        {loading ? 'Saving...' : 'Save Email'}
                    </button>
                </div>
            )}
            {activeSubTab === 'password' && (
                <div className="space-y-4">
                    <div>
                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                            <LockClosedIcon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                            Current Password
                        </label>
                        <div className="relative">
                            <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600 dark:text-gray-400 pointer-events-none" />
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={handleChange(setCurrentPassword)}
                                placeholder="Enter current password"
                                className="mt-1 w-full pl-10 p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition duration-200"
                                disabled={loading}
                                aria-label="Current password"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                            <LockClosedIcon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                            New Password
                        </label>
                        <div className="relative">
                            <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600 dark:text-gray-400 pointer-events-none" />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={handleChange(setNewPassword)}
                                placeholder="Enter new password"
                                className="mt-1 w-full pl-10 p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition duration-200"
                                disabled={loading}
                                aria-label="New password"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                            <LockClosedIcon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600 dark:text-gray-400 pointer-events-none" />
                            <input
                                type="password"
                                value={confirmNewPassword}
                                onChange={handleChange(setConfirmNewPassword)}
                                placeholder="Confirm new password"
                                className="mt-1 w-full pl-10 p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition duration-200"
                                disabled={loading}
                                aria-label="Confirm new password"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleChangePassword}
                        disabled={loading}
                        className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 transition-all duration-500 ease-in-out transform hover:scale-105 active:scale-95 flex items-center ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        aria-label="Save password"
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
                        {loading ? 'Saving...' : 'Save Password'}
                    </button>
                </div>
            )}
            {activeSubTab === '2fa' && (
                <div className="space-y-4">
                    <label className="flex items-center text-gray-700 dark:text-gray-300">
                        <KeyIcon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                        Two-Factor Authentication (2FA)
                    </label>
                    {!totpEnabled && !totpQrCode && (
                        <button
                            onClick={handleSetupTotp}
                            disabled={loading}
                            className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 transition-all duration-500 ease-in-out transform hover:scale-105 active:scale-95 flex items-center ${
                                loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            aria-label="Enable 2FA"
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
                                <KeyIcon className="w-5 h-5 mr-2" />
                            )}
                            {loading ? 'Processing...' : 'Enable 2FA'}
                        </button>
                    )}
                    {totpQrCode && (
                        <div className="mt-2">
                            <img
                                src={totpQrCode}
                                alt="TOTP QR Code"
                                className="max-w-xs mx-auto animate-fadeInShort"
                            />
                            <div className="relative">
                                <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600 dark:text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    value={totpToken}
                                    onChange={(e) => setTotpToken(e.target.value)}
                                    placeholder="Enter TOTP code"
                                    className="mt-2 w-full pl-10 p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition duration-200"
                                    disabled={loading}
                                    aria-label="TOTP code"
                                />
                            </div>
                            <button
                                onClick={handleVerifyTotp}
                                disabled={loading || !totpToken}
                                className={`mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 transition-all duration-500 ease-in-out transform hover:scale-105 active:scale-95 flex items-center ${
                                    loading || !totpToken ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                aria-label="Verify 2FA"
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
                                    <KeyIcon className="w-5 h-5 mr-2" />
                                )}
                                {loading ? 'Verifying...' : 'Verify 2FA'}
                            </button>
                        </div>
                    )}
                    {totpEnabled && !totpQrCode && (
                        <div className="mt-2 space-y-4">
                            <p className="text-green-500 dark:text-green-400 animate-fadeInShort">
                                2FA is enabled.
                            </p>
                            <div className="relative">
                                <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600 dark:text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    value={totpToken}
                                    onChange={(e) => setTotpToken(e.target.value)}
                                    placeholder="Enter TOTP code to disable"
                                    className="mt-2 w-full pl-10 p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition duration-200"
                                    disabled={loading}
                                    aria-label="TOTP code to disable"
                                />
                            </div>
                            <button
                                onClick={handleDisableTotp}
                                disabled={loading}
                                className={`mt-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 disabled:opacity-50 transition-all duration-500 ease-in-out transform hover:scale-105 active:scale-95 flex items-center ${
                                    loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                aria-label="Disable 2FA"
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
                                    <KeyIcon className="w-5 h-5 mr-2" />
                                )}
                                {loading ? 'Disabling...' : 'Disable 2FA'}
                            </button>
                        </div>
                    )}
                </div>
            )}
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