'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuthSettings } from './useAuthSettings';
import { useUserSettings } from './useUserSettings';

export const useAccountSettingsLogic = () => {
    const authSettings = useAuthSettings();
    const userSettings = useUserSettings();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isExitingError, setIsExitingError] = useState(false);
    const [isExitingMessage, setIsExitingMessage] = useState(false);
    const dismissedErrorsRef = useRef<Set<string>>(new Set());
    const dismissedMessagesRef = useRef<Set<string>>(new Set());

    // Combine messages and errors from hooks, respecting dismissed ones
    useEffect(() => {
        const combinedError = [authSettings.error, userSettings.error].filter(Boolean).join('; ') || null;
        const combinedMessage = [authSettings.message, userSettings.message].filter(Boolean).join('; ') || null;

        if (combinedError && !dismissedErrorsRef.current.has(combinedError) && combinedError !== error) {
            setError(combinedError);
            setIsExitingError(false);
        }
        if (combinedMessage && !dismissedMessagesRef.current.has(combinedMessage) && combinedMessage !== message) {
            setMessage(combinedMessage);
            setIsExitingMessage(false);
        }

        // Clear dismissed messages/errors if the source is cleared
        if (!combinedError && dismissedErrorsRef.current.size > 0) {
            dismissedErrorsRef.current.clear();
        }
        if (!combinedMessage && dismissedMessagesRef.current.size > 0) {
            dismissedMessagesRef.current.clear();
        }
    }, [authSettings.error, authSettings.message, userSettings.error, userSettings.message, error, message]);

    const isLoading = loading || authSettings.loading || userSettings.loading;

    const dismissMessage = (type: 'error' | 'message') => {
        if (type === 'error' && error) {
            setIsExitingError(true);
            dismissedErrorsRef.current.add(error);
            setTimeout(() => {
                setError(null);
                setIsExitingError(false);
            }, 500);
        } else if (type === 'message' && message) {
            setIsExitingMessage(true);
            dismissedMessagesRef.current.add(message);
            setTimeout(() => {
                setMessage(null);
                setIsExitingMessage(false);
            }, 500);
        }
    };

    useEffect(() => {
        let errorTimeout: NodeJS.Timeout;
        let messageTimeout: NodeJS.Timeout;

        if (error && !dismissedErrorsRef.current.has(error)) {
            errorTimeout = setTimeout(() => {
                setIsExitingError(true);
                dismissedErrorsRef.current.add(error);
                setTimeout(() => {
                    setError(null);
                    setIsExitingError(false);
                }, 500);
            }, 5000);
        }

        if (message && !dismissedMessagesRef.current.has(message)) {
            messageTimeout = setTimeout(() => {
                setIsExitingMessage(true);
                dismissedMessagesRef.current.add(message);
                setTimeout(() => {
                    setMessage(null);
                    setIsExitingMessage(false);
                }, 500);
            }, 5000);
        }

        return () => {
            clearTimeout(errorTimeout);
            clearTimeout(messageTimeout);
        };
    }, [error, message]);

    return {
        user: authSettings.user,
        username: authSettings.username,
        setUsername: authSettings.setUsername,
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
        handleUpdateUsername: authSettings.handleUpdateUsername,
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
        isExitingError,
        isExitingMessage,
        dismissMessage,
        loading: isLoading,
        setLoading,
        setError,
        setMessage
    };
};