'use client';
import React, { useState, Dispatch, SetStateAction } from 'react';
import { PencilIcon, EnvelopeIcon, LockClosedIcon, KeyIcon, ShieldCheckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

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
    message: string | null;
    error: string | null;
}

export default function SecurityTab({
                                        username, setUsername,
                                        newEmail, setNewEmail,
                                        currentPassword, setCurrentPassword,
                                        newPassword, setNewPassword,
                                        confirmNewPassword, setConfirmNewPassword,
                                        totpEnabled, totpQrCode, totpToken, setTotpToken,
                                        handleUpdateUsername, handleChangeEmail, handleChangePassword,
                                        handleSetupTotp, handleVerifyTotp, handleDisableTotp,
                                        loading, message, error
                                    }: SecurityTabProps) {
    const [activeSubTab, setActiveSubTab] = useState('username');

    const subTabs = [
        { name: 'username', label: 'Username', icon: PencilIcon },
        { name: 'email', label: 'Email', icon: EnvelopeIcon },
        { name: 'password', label: 'Password', icon: LockClosedIcon },
        { name: '2fa', label: '2FA', icon: ShieldCheckIcon },
    ];

    const handleChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log('Input changed to:', e.target.value);
        setter(e.target.value);
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
            {activeSubTab === 'username' && (
                <div className="space-y-4">
                    <div>
                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                            <PencilIcon className="w-5 h-5 mr-2" />
                            Username
                        </label>
                        <input
                            value={username}
                            onChange={handleChange(setUsername)}
                            placeholder="Enter new username"
                            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                            disabled={loading}
                        />
                    </div>
                    <button
                        onClick={() => {
                            console.log('Save Username clicked, current username:', username);
                            handleUpdateUsername();
                        }}
                        disabled={loading}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        {loading ? 'Saving...' : 'Save Username'}
                    </button>
                </div>
            )}
            {activeSubTab === 'email' && (
                <div className="space-y-4">
                    <div>
                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                            <EnvelopeIcon className="w-5 h-5 mr-2" />
                            New Email
                        </label>
                        <input
                            value={newEmail}
                            onChange={handleChange(setNewEmail)}
                            placeholder="Enter new email"
                            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                            disabled={loading}
                        />
                    </div>
                    <button
                        onClick={handleChangeEmail}
                        disabled={loading}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        {loading ? 'Saving...' : 'Save Email'}
                    </button>
                </div>
            )}
            {activeSubTab === 'password' && (
                <div className="space-y-4">
                    <div>
                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                            <LockClosedIcon className="w-5 h-5 mr-2" />
                            Current Password
                        </label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={handleChange(setCurrentPassword)}
                            placeholder="Enter current password"
                            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                            <LockClosedIcon className="w-5 h-5 mr-2" />
                            New Password
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={handleChange(setNewPassword)}
                            placeholder="Enter new password"
                            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                            <LockClosedIcon className="w-5 h-5 mr-2" />
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            value={confirmNewPassword}
                            onChange={handleChange(setConfirmNewPassword)}
                            placeholder="Confirm new password"
                            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                            disabled={loading}
                        />
                    </div>
                    <button
                        onClick={handleChangePassword}
                        disabled={loading}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        {loading ? 'Saving...' : 'Save Password'}
                    </button>
                </div>
            )}
            {activeSubTab === '2fa' && (
                <div className="space-y-4">
                    <label className="flex items-center text-gray-700 dark:text-gray-300">
                        <KeyIcon className="w-5 h-5 mr-2" />
                        Two-Factor Authentication (2FA)
                    </label>
                    {!totpEnabled && !totpQrCode && (
                        <button
                            onClick={handleSetupTotp}
                            disabled={loading}
                            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 flex items-center"
                        >
                            <KeyIcon className="w-5 h-5 mr-2" />
                            Enable 2FA
                        </button>
                    )}
                    {totpQrCode && (
                        <div className="mt-2">
                            <img src={totpQrCode} alt="TOTP QR Code" className="max-w-xs mx-auto" />
                            <input
                                type="text"
                                value={totpToken}
                                onChange={(e) => setTotpToken(e.target.value)}
                                placeholder="Enter TOTP code"
                                className="mt-2 w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                                disabled={loading}
                            />
                            <button
                                onClick={handleVerifyTotp}
                                disabled={loading || !totpToken}
                                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 flex items-center"
                            >
                                <KeyIcon className="w-5 h-5 mr-2" />
                                {loading ? 'Verifying...' : 'Verify 2FA'}
                            </button>
                        </div>
                    )}
                    {totpEnabled && !totpQrCode && (
                        <div className="mt-2">
                            <p className="text-green-500 dark:text-green-400">2FA is enabled.</p>
                            <input
                                type="text"
                                value={totpToken}
                                onChange={(e) => setTotpToken(e.target.value)}
                                placeholder="Enter TOTP code to disable"
                                className="mt-2 w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                                disabled={loading}
                            />
                            <button
                                onClick={handleDisableTotp}
                                disabled={loading}
                                className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 disabled:opacity-50 flex items-center"
                            >
                                <KeyIcon className="w-5 h-5 mr-2" />
                                {loading ? 'Disabling...' : 'Disable 2FA'}
                            </button>
                        </div>
                    )}
                </div>
            )}
            {message && <p className="text-green-500 dark:text-green-400 text-sm mt-4">{message}</p>}
            {error && <p className="text-red-500 dark:text-red-400 text-sm mt-4">{error}</p>}
        </div>
    );
}