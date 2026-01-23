'use client';
import { useState, useEffect } from 'react';
import { updateProfile, updatePersonalization } from '@/services/users';
import { useDashboardSharedContext } from '@/context/DashboardSharedContext';
import { useApi } from '@/hooks/useApi';

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
    const {
        loading,
        error,
        message,
        execute,
        setLoading
    } = useApi();

    const [avatar, setAvatar] = useState<File | null>(null);
    const [header, setHeader] = useState<File | null>(null);

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

        if (!hasChanges) return;

        await execute(async () => {
            const response = await updateProfile(data);
            setUser({ ...user!, user: { ...user!.user, ...response.user } });
            setOriginalProfileState(data);
            return response;
        }, 'Profile updated successfully');
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

        if (!hasChanges) return;

        await execute(async () => {
            const response = await updatePersonalization(data);
            setUser({
                ...user!,
                user: { ...user!.user, ...response.user },
            });
            setOriginalPersonalizationState({ bio: response.user.bio || '', gender: response.user.gender || 'prefer-not-to-say' });
            setAvatar(null);
            setHeader(null);
            window.dispatchEvent(new Event('resetFileInputs'));
            return response;
        }, 'Personalization updated successfully');
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