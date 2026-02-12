'use client';

import React from 'react';
import { useProfileLogic } from '@/features/profile/hooks/useProfile';
import { FeedbackToasts } from '@/components/ui';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileInfo } from '@/components/profile/ProfileInfo';

export default function ProfileSection() {
    const {
        user,
        avatar,
        setAvatar,
        header,
        setHeader,
        handleUpdateAppearance,
        loading,
        message,
        error,
        dismissMessage,
        isExitingError,
        isExitingMessage
    } = useProfileLogic();

    if (!user) return null;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    // logic for previews or existing images
    const getAvatarUrl = () => {
        if (avatar instanceof File) return URL.createObjectURL(avatar);
        if (user.avatar) return `${backendUrl}${user.avatar}`;
        return null;
    };

    const getHeaderUrl = () => {
        if (header instanceof File) return URL.createObjectURL(header);
        if (user.header) return `${backendUrl}${user.header}`;
        return null;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'header') => {
        const file = e.target.files?.[0];
        if (file) {
            if (type === 'avatar') setAvatar(file);
            else setHeader(file);
        }
    };

    const avatarUrl = getAvatarUrl();
    const headerUrl = getHeaderUrl();

    const dismissError = () => dismissMessage('error');
    const dismissFeedbackMessage = () => dismissMessage('message');

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-10 animate-slide-up-fade">
            {/* Unified Feedback Area */}
            <FeedbackToasts
                error={error}
                message={message}
                isExitingError={isExitingError}
                isExitingMessage={isExitingMessage}
                dismissError={dismissError}
                dismissMessage={dismissFeedbackMessage}
            />

            {/* profile header area */}
            <ProfileHeader
                user={user}
                avatar={avatar}
                header={header}
                avatarUrl={avatarUrl}
                headerUrl={headerUrl}
                handleFileChange={handleFileChange}
                handleUpdateAppearance={handleUpdateAppearance}
                loading={loading}
            />

            <main className="max-w-4xl mx-auto mt-10">
                <ProfileInfo user={user} />
            </main>

            <footer className="text-center py-10">
                <div className="inline-flex items-center gap-4 px-4 py-2 rounded-2xl bg-gray-50 dark:bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center font-bold text-[8px]">
                        S
                    </div>
                    Profile Secured by SecureNote
                </div>
            </footer>
        </div>
    );
}