'use client';
import { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';
import { changeEmail, changePassword, setupTotp, verifyTotp, disableTotp, requestVerification, updateUsername } from '@/services/auth';
import { useDashboardSharedContext } from '@/context/DashboardSharedContext';
import { useApi } from '@/hooks/useApi';

interface AuthSettings {
    user: ReturnType<typeof useDashboardSharedContext>['user'];
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
    setTotpEnabled: Dispatch<SetStateAction<boolean>>;
    totpQrCode: string | null;
    setTotpQrCode: Dispatch<SetStateAction<string | null>>;
    totpToken: string;
    setTotpToken: Dispatch<SetStateAction<string>>;
    handleUpdateUsername: () => Promise<void>;
    handleChangeEmail: () => Promise<void>;
    handleChangePassword: () => Promise<void>;
    handleSetupTotp: () => Promise<void>;
    handleVerifyTotp: () => Promise<void>;
    handleDisableTotp: () => Promise<void>;
    handleRequestVerification: () => Promise<void>;
    message: string | null;
    error: string | null;
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
}

export const useAuthSettings = (): AuthSettings => {
    const { user, setUser } = useDashboardSharedContext();
    const {
        loading,
        error,
        message,
        setError,
        setLoading,
        execute
    } = useApi();

    const [username, setUsernameState] = useState(user?.user.username || '');
    const originalUsernameRef = useRef(user?.user.username || '');
    const [newEmail, setNewEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [totpEnabled, setTotpEnabled] = useState(user?.user.isTotpEnabled || false);
    const [totpQrCode, setTotpQrCode] = useState<string | null>(null);
    const [totpToken, setTotpToken] = useState('');
    const [isInitialized, setIsInitialized] = useState(!!user);

    useEffect(() => {
        if (!isInitialized && user) {
            setUsernameState(user.user.username || '');
            setTotpEnabled(user.user.isTotpEnabled || false);
            setIsInitialized(true);
        }
    }, [user, isInitialized]);

    const updateUserField = (field: keyof NonNullable<typeof user>['user'], value: any) => {
        if (!user) return;
        setUser({
            ...user,
            user: { ...user.user, [field]: value },
        });
    };

    const handleUpdateUsername = async () => {
        const originalUsername = originalUsernameRef.current;
        if (!username || username === originalUsername) return;

        await execute(async () => {
            await updateUsername(username);
            updateUserField('username', username);
            originalUsernameRef.current = username;
        }, 'Username updated successfully');
    };

    const handleChangeEmail = async () => {
        if (!newEmail || newEmail === user?.user.email) return;

        await execute(async () => {
            const response = await changeEmail(newEmail);
            updateUserField('email', newEmail);
            setNewEmail('');
            return response;
        }, 'Email change requested. Check your new email');
    };

    const handleChangePassword = async () => {
        if (!currentPassword && !newPassword && !confirmNewPassword) return;

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            setError('All password fields are required when changing password');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setError('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        await execute(async () => {
            await changePassword(currentPassword, newPassword);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        }, 'Password updated successfully');
    };

    const handleSetupTotp = async () => {
        await execute(async () => {
            const { qrCodeDataURL } = await setupTotp();
            setTotpQrCode(qrCodeDataURL);
        }, 'Scan the QR code to enable 2FA');
    };

    const handleVerifyTotp = async () => {
        if (!totpToken) return;
        await execute(async () => {
            await verifyTotp(totpToken);
            setTotpEnabled(true);
            setTotpQrCode(null);
            setTotpToken('');
            updateUserField('isTotpEnabled', true);
        }, '2FA enabled successfully');
    };

    const handleDisableTotp = async () => {
        if (!totpToken) {
            setError('Please enter a TOTP code to disable 2FA');
            return;
        }
        await execute(async () => {
            await disableTotp(totpToken);
            setTotpEnabled(false);
            setTotpToken('');
            updateUserField('isTotpEnabled', false);
        }, '2FA disabled successfully');
    };

    const handleRequestVerification = async () => {
        await execute(async () => {
            const response = await requestVerification();
            // update global state to reflect pending status immediately
            if (user && setUser) {
                setUser({
                    ...user,
                    user: { ...user.user, verificationPending: true }
                });
            }
            return response;
        }, 'Verification request sent');
    };

    return {
        user,
        username,
        setUsername: setUsernameState,
        newEmail,
        setNewEmail,
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        confirmNewPassword,
        setConfirmNewPassword,
        totpEnabled,
        setTotpEnabled,
        totpQrCode,
        setTotpQrCode,
        totpToken,
        setTotpToken,
        handleUpdateUsername,
        handleChangeEmail,
        handleChangePassword,
        handleSetupTotp,
        handleVerifyTotp,
        handleDisableTotp,
        handleRequestVerification,
        message,
        error,
        loading,
        setLoading,
    };
};