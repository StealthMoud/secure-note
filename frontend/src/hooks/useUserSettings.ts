'use client';
import { useState, useEffect } from 'react';
import { updateProfile, updatePersonalization } from '@/services/users';
import { useDashboardSharedContext } from '@/app/context/DashboardSharedContext';

interface UserData {
    user: {
        _id: string;
        username: string;
        email: string;
        role: string;
        verified?: boolean;
        githubId?: string;
        firstName?: string;
        lastName?: string;
        nickname?: string;
        birthday?: string;
        country?: string;
        bio?: string;
        gender?: string;
        avatar?: string;
        header?: string;
        isTotpEnabled?: boolean;
    };
    role: string;
}

interface Profile {
    firstName: string;
    lastName: string;
    nickname: string;
    birthday: string;
    country: string;
}

interface Personalization {
    bio: string;
    gender: string;
}

export const useUserSettings = () => {
    const { user, setUser } = useDashboardSharedContext();

    const [avatar, setAvatar] = useState<File | null>(null);
    const [header, setHeader] = useState<File | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [originalProfile, setOriginalProfileState] = useState<Profile>(() => ({
        firstName: user?.user.firstName || '',
        lastName: user?.user.lastName || '',
        nickname: user?.user.nickname || '',
        birthday: user?.user.birthday || '',
        country: user?.user.country || '',
    }));
    const [originalPersonalization, setOriginalPersonalizationState] = useState<Personalization>(() => ({
        bio: user?.user.bio || '',
        gender: user?.user.gender || 'prefer-not-to-say',
    }));

    const [isInitialized, setIsInitialized] = useState(!!user);

    useEffect(() => {
        if (!isInitialized && user) {
            setOriginalProfileState({
                firstName: user.user.firstName || '',
                lastName: user.user.lastName || '',
                nickname: user.user.nickname || '',
                birthday: user.user.birthday || '',
                country: user.user.country || '',
            });
            setOriginalPersonalizationState({
                bio: user.user.bio || '',
                gender: user.user.gender || 'prefer-not-to-say',
            });
            setIsInitialized(true);
        }
    }, [user, isInitialized]);

    const updateUserField = (field: keyof UserData['user'], value: string) => {
        if (!user) return;
        setUser({
            ...user,
            user: { ...user.user, [field]: value },
        });
    };

    const handleUpdateProfile = async () => {
        const data: Profile = {
            firstName: user?.user.firstName || '',
            lastName: user?.user.lastName || '',
            nickname: user?.user.nickname || '',
            birthday: user?.user.birthday || '',
            country: user?.user.country || '',
        };

        const hasChanges = Object.keys(data).some(
            (key) => data[key as keyof Profile] !== originalProfile[key as keyof Profile] && (data[key as keyof Profile] || originalProfile[key as keyof Profile])
        );

        if (!hasChanges) {
            console.log('No changes detected in profile data:', data);
            console.log('Original profile:', originalProfile);
            return;
        }

        console.log('Sending profile update:', data);

        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const response = await updateProfile(data);
            console.log('Profile update response:', response);
            setUser({ ...user!, user: { ...user!.user, ...response.user } }); // Use backend response
            setOriginalProfileState(data);
            setMessage('Profile updated successfully');
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
            console.error('Update profile error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePersonalization = async () => {
        const data: { avatar?: File; header?: File; bio?: string; gender?: string } = {
            bio: user?.user.bio || '',
            gender: user?.user.gender || 'prefer-not-to-say',
        };
        if (avatar) data.avatar = avatar;
        if (header) data.header = header;

        const hasChanges =
            data.bio !== originalPersonalization.bio ||
            data.gender !== originalPersonalization.gender ||
            data.avatar ||
            data.header;

        if (!hasChanges) {
            console.log('No changes detected in personalization data:', data);
            return;
        }

        console.log('Sending personalization update:', data);

        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const response = await updatePersonalization(data);
            console.log('Personalization update response:', response);
            setUser({
                ...user!,
                user: { ...user!.user, ...response.user }, // Use backend response
            });
            setOriginalPersonalizationState({ bio: response.user.bio || '', gender: response.user.gender || 'prefer-not-to-say' });
            setAvatar(null);
            setHeader(null);
            setMessage('Personalization updated successfully');
            window.dispatchEvent(new Event('resetFileInputs'));
        } catch (err: any) {
            setError(err.message || 'Failed to update personalization');
            console.error('Update personalization error:', err);
        } finally {
            setLoading(false);
        }
    };

    return {
        firstName: user?.user.firstName || '',
        setFirstName: (value: string) => updateUserField('firstName', value),
        lastName: user?.user.lastName || '',
        setLastName: (value: string) => updateUserField('lastName', value),
        nickname: user?.user.nickname || '',
        setNickname: (value: string) => updateUserField('nickname', value),
        birthday: user?.user.birthday || '',
        setBirthday: (value: string) => updateUserField('birthday', value),
        country: user?.user.country || '',
        setCountry: (value: string) => updateUserField('country', value),
        avatar,
        setAvatar,
        header,
        setHeader,
        bio: user?.user.bio || '',
        setBio: (value: string) => updateUserField('bio', value),
        gender: user?.user.gender || 'prefer-not-to-say',
        setGender: (value: string) => updateUserField('gender', value),
        handleUpdateProfile,
        handleUpdatePersonalization,
        message,
        error,
        loading,
        setLoading,
    };
};