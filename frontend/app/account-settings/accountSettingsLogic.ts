'use client';
import { useDashboardSharedContext } from '@/app/context/DashboardSharedContext';
import { requestVerification, updateProfile, updatePersonalization, changeEmail, changePassword, setupTotp, verifyTotp, disableTotp } from '@/services/auth';
import { useState } from 'react';

export const useAccountSettingsLogic = () => {
    const { user } = useDashboardSharedContext();

    const [username, setUsername] = useState(user?.user.username || '');
    const [firstName, setFirstName] = useState(user?.user.firstName || '');
    const [lastName, setLastName] = useState(user?.user.lastName || '');
    const [nickname, setNickname] = useState(user?.user.nickname || '');
    const [birthday, setBirthday] = useState(user?.user.birthday ? new Date(user.user.birthday).toISOString().split('T')[0] : '');
    const [country, setCountry] = useState(user?.user.country || '');
    const [newEmail, setNewEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [avatar, setAvatar] = useState<File | null>(null);
    const [header, setHeader] = useState<File | null>(null);
    const [bio, setBio] = useState(user?.user.bio || '');
    const [gender, setGender] = useState(user?.user.gender || 'prefer-not-to-say');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [totpEnabled, setTotpEnabled] = useState(user?.user.isTotpEnabled || false);
    const [totpQrCode, setTotpQrCode] = useState<string | null>(null);
    const [totpToken, setTotpToken] = useState('');

    const handleUpdateUsername = async () => {
        if (username === user?.user.username) return; // No change
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
            setMessage('Username updated successfully!');
        } catch (err: any) {
            setError(err.message || 'Failed to update username.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const data = { firstName, lastName, nickname, birthday, country };
            const response = await updateProfile(data);
            setMessage(response.message);
        } catch (err: any) {
            setError(err.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleChangeEmail = async () => {
        if (!newEmail) return; // No change
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const response = await changeEmail(newEmail);
            setMessage(response.message);
            setNewEmail('');
        } catch (err: any) {
            setError(err.message || 'Failed to change email.');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) return; // No change
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const response = await changePassword(currentPassword, newPassword);
            setMessage(response.message);
            setCurrentPassword('');
            setNewPassword('');
        } catch (err: any) {
            setError(err.message || 'Failed to change password.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePersonalization = async () => {
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const data: any = { bio, gender };
            if (avatar) data.avatar = avatar;
            if (header) data.header = header;
            const response = await updatePersonalization(data);
            setMessage(response.message);
            setAvatar(null);
            setHeader(null);
        } catch (err: any) {
            setError(err.message || 'Failed to update personalization.');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestVerification = async () => {
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const response = await requestVerification();
            setMessage(response.message);
        } catch (err: any) {
            setError(err.message || 'Failed to request verification.');
        } finally {
            setLoading(false);
        }
    };

    const handleSetupTotp = async () => {
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const { qrCodeDataURL } = await setupTotp();
            setTotpQrCode(qrCodeDataURL);
            setMessage('Scan the QR code with your authenticator app.');
        } catch (err: any) {
            setError(err.message || 'Failed to setup TOTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyTotp = async () => {
        if (!totpToken) return;
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const response = await verifyTotp(totpToken);
            setTotpEnabled(true);
            setTotpQrCode(null);
            setTotpToken('');
            setMessage(response.message);
        } catch (err: any) {
            setError(err.message || 'Failed to verify TOTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleDisableTotp = async () => {
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const response = await disableTotp(totpToken || undefined);
            setTotpEnabled(false);
            setTotpToken('');
            setMessage(response.message);
        } catch (err: any) {
            setError(err.message || 'Failed to disable TOTP.');
        } finally {
            setLoading(false);
        }
    };

    return {
        user,
        username, setUsername,
        firstName, setFirstName,
        lastName, setLastName,
        nickname, setNickname,
        birthday, setBirthday,
        country, setCountry,
        newEmail, setNewEmail,
        currentPassword, setCurrentPassword,
        newPassword, setNewPassword,
        avatar, setAvatar,
        header, setHeader,
        bio, setBio,
        gender, setGender,
        totpEnabled, setTotpEnabled,
        totpQrCode, setTotpQrCode,
        totpToken, setTotpToken,
        handleUpdateUsername,
        handleUpdateProfile,
        handleChangeEmail,
        handleChangePassword,
        handleUpdatePersonalization,
        handleRequestVerification,
        handleSetupTotp,
        handleVerifyTotp,
        handleDisableTotp,
        message,
        error,
        loading,
    };
};