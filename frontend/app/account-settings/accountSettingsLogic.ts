'use client';
import { useState } from 'react';
import { useAuthSettings } from '@/hooks/useAuthSettings';
import { useUserSettings } from '@/hooks/useUserSettings';

export const useAccountSettingsLogic = () => {
    const authSettings = useAuthSettings();
    const userSettings = useUserSettings();
    const [loading, setLoading] = useState(false);

    const message = [authSettings.message, userSettings.message].filter(Boolean).join('; ') || null;
    const error = [authSettings.error, userSettings.error].filter(Boolean).join('; ') || null;

    const isLoading = loading || authSettings.loading || userSettings.loading;

    return {
        user: authSettings.user,
        username: authSettings.username, // Changed from userSettings
        setUsername: authSettings.setUsername, // Changed from userSettings
        firstName: userSettings.firstName,
        setFirstName: userSettings.setFirstName,
        lastName: userSettings.lastName,
        setLastName: userSettings.setLastName,
        nickname: userSettings.nickname,
        setNickname: userSettings.setNickname,
        birthday: userSettings.birthday,
        setBirthday: userSettings.setBirthday,
        country: userSettings.country,
        setCountry: userSettings.setCountry,
        avatar: userSettings.avatar,
        setAvatar: userSettings.setAvatar,
        header: userSettings.header,
        setHeader: userSettings.setHeader,
        bio: userSettings.bio,
        setBio: userSettings.setBio,
        gender: userSettings.gender,
        setGender: userSettings.setGender,
        handleUpdateUsername: authSettings.handleUpdateUsername, // Changed from userSettings
        handleUpdateProfile: userSettings.handleUpdateProfile,
        handleUpdatePersonalization: userSettings.handleUpdatePersonalization,
        newEmail: authSettings.newEmail,
        setNewEmail: authSettings.setNewEmail,
        currentPassword: authSettings.currentPassword,
        setCurrentPassword: authSettings.setCurrentPassword,
        newPassword: authSettings.newPassword,
        setNewPassword: authSettings.setNewPassword,
        confirmNewPassword: authSettings.confirmNewPassword,
        setConfirmNewPassword: authSettings.setConfirmNewPassword,
        totpEnabled: authSettings.totpEnabled,
        setTotpEnabled: authSettings.setTotpEnabled,
        totpQrCode: authSettings.totpQrCode,
        setTotpQrCode: authSettings.setTotpQrCode,
        totpToken: authSettings.totpToken,
        setTotpToken: authSettings.setTotpToken,
        handleChangeEmail: authSettings.handleChangeEmail,
        handleChangePassword: authSettings.handleChangePassword,
        handleSetupTotp: authSettings.handleSetupTotp,
        handleVerifyTotp: authSettings.handleVerifyTotp,
        handleDisableTotp: authSettings.handleDisableTotp,
        handleRequestVerification: authSettings.handleRequestVerification,
        message,
        error,
        loading: isLoading,
        setLoading,
    };
};