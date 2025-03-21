'use client';
import React, { useCallback, useRef } from 'react';
import { useProfileLogic } from './profileLogic';
import {
    UserIcon,
    EnvelopeIcon,
    PhotoIcon,
    CalendarIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    MapPinIcon,
    CakeIcon,
    ShieldCheckIcon,
    UsersIcon,
    IdentificationIcon,
} from '@heroicons/react/24/outline';

interface ProfileFieldProps {
    icon: React.ElementType;
    label: string;
    value: string;
}

const ProfileField: React.FC<ProfileFieldProps> = ({ icon: Icon, label, value }) => (
    <div className="flex items-center space-x-2">
        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <span className="text-gray-700 dark:text-gray-300">
            <span className="font-semibold">{label}:</span> {value}
        </span>
    </div>
);

export default function ProfileSection() {
    const {
        user,
        avatar,
        header,
        setAvatar,
        setHeader,
        handleUpdateAppearance,
        message,
        error,
        loading,
    } = useProfileLogic();

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const headerInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) setAvatar(file);
    }, [setAvatar]);

    const handleHeaderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) setHeader(file);
    }, [setHeader]);

    const triggerAvatarUpload = () => avatarInputRef.current?.click();
    const triggerHeaderUpload = () => headerInputRef.current?.click();

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002';
    const avatarUrl = avatar instanceof File ? URL.createObjectURL(avatar) : (avatar ? `${backendUrl}${avatar}?t=${Date.now()}` : '/default-avatar.jpg');
    const headerUrl = header instanceof File ? URL.createObjectURL(header) : (header ? `${backendUrl}${header}?t=${Date.now()}` : '/default-header.jpg');

    const profileData = {
        joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not set',
        lastUpdated: user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Not set',
        birthday: user.birthday ? new Date(user.birthday).toLocaleDateString() : 'Not set',
        friendCount: user.friends?.length || 0,
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Not set',
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header and Avatar Section */}
            <div className="relative mb-1">
                {/* Header Image */}
                <div className="border border-gray-700 dark:border-gray-300 rounded-lg overflow-hidden">
                    <img
                        src={headerUrl}
                        alt="Header"
                        className="w-full h-40 object-cover"
                        key={headerUrl}
                    />
                    <button
                        onClick={triggerHeaderUpload}
                        className="absolute top-2 right-2 p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                        disabled={loading}
                        aria-label="Upload header"
                    >
                        <PhotoIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                    <input
                        type="file"
                        accept="image/*"
                        ref={headerInputRef}
                        onChange={handleHeaderChange}
                        className="hidden"
                    />
                </div>

                {/* Avatar (overlapping header) */}
                <div className="absolute -bottom-12 left-4">
                    <div className="relative border border-gray-700 dark:border-gray-300 rounded-full">
                        <img
                            src={avatarUrl}
                            alt="Avatar"
                            className="w-24 h-24 rounded-full shadow-md"
                            key={avatarUrl}
                        />
                        <button
                            onClick={triggerAvatarUpload}
                            className="absolute bottom-0 right-0 p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                            disabled={loading}
                            aria-label="Upload avatar"
                        >
                            <PhotoIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </button>
                        <input
                            type="file"
                            accept="image/*"
                            ref={avatarInputRef}
                            onChange={handleAvatarChange}
                            className="hidden"
                        />
                    </div>
                </div>
            </div>

            {/* Username & Email (under the border, below avatar) */}
            <div className="pl-32 -mt-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user.username}</h1>
                <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
            </div>


            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* About Me Section */}
                <div className="md:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-shadow duration-200">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                        <InformationCircleIcon className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300" />
                        About Me
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 break-words" style={{ minHeight: '2rem', maxHeight: '6rem', overflowY: 'auto' }}>
                        {user.bio || 'No bio provided'}
                    </p>
                </div>

                {/* Personal Info */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-shadow duration-200">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                        <IdentificationIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                        Personal Info
                    </h2>
                    <div className="space-y-3">
                        <ProfileField icon={UserIcon} label="Name" value={profileData.fullName} />
                        <ProfileField icon={UserIcon} label="Nickname" value={user.nickname || 'Not set'} />
                        <ProfileField icon={CakeIcon} label="Birthday" value={profileData.birthday} />
                        <ProfileField icon={UserIcon} label="Gender" value={user.gender || 'Not set'} />
                        <ProfileField icon={MapPinIcon} label="Country" value={user.country || 'Not set'} />
                    </div>
                </div>

                {/* Account Info */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-shadow duration-200">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                        <ShieldCheckIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                        Account Details
                    </h2>
                    <div className="space-y-3">
                        <ProfileField icon={CalendarIcon} label="Joined" value={profileData.joinDate} />
                        <ProfileField icon={CalendarIcon} label="Last Updated" value={profileData.lastUpdated} />
                        <ProfileField icon={ShieldCheckIcon} label="Role" value={user.role} />
                        <ProfileField icon={ShieldCheckIcon} label="Verified" value={user.verified ? 'Yes' : 'No'} />
                        <ProfileField icon={UsersIcon} label="Friends" value={profileData.friendCount.toString()} />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end">
                <button
                    onClick={handleUpdateAppearance}
                    disabled={loading || (!avatar && !header)}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 flex items-center transition-colors"
                >
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    {loading ? 'Saving...' : 'Save Appearance'}
                </button>
            </div>

            {/* Messages */}
            {message && (
                <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg text-green-700 dark:text-green-300 text-sm">
                    {message}
                </div>
            )}
            {error && (
                <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg text-red-700 dark:text-red-300 text-sm">
                    {error}
                </div>
            )}
        </div>
    );
}