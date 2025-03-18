'use client';
import { useState } from 'react';

export const useProfileLogic = () => {
    // Simulated user data for a secure note app
    const simulatedUser = {
        username: 'NoteMaster',
        email: 'secure.notes@example.com',
        createdAt: '2023-06-01T09:00:00Z', // Simulated join date
    };

    // Simulated friends data
    const simulatedFriends = [
        { _id: '1', username: 'Alice' },
        { _id: '2', username: 'Bob' },
        { _id: '3', username: 'Charlie' },
    ];

    // Simulated note stats
    const simulatedNoteStats = {
        totalNotes: 42,
        sharedNotes: 8,
    };

    // Local state for profile
    const [username, setUsername] = useState(simulatedUser.username);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Simulate updating username
    const handleUpdateUsername = async () => {
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setMessage('Username updated successfully!');
        } catch (err) {
            setError('Failed to update username.');
        } finally {
            setLoading(false);
        }
    };

    // Friend and note stats from simulated data
    const friendCount = simulatedFriends.length;
    const { totalNotes, sharedNotes } = simulatedNoteStats;

    return {
        user: simulatedUser,
        username,
        setUsername,
        friends: simulatedFriends,
        friendCount,
        totalNotes,
        sharedNotes,
        handleUpdateUsername,
        message,
        error,
        loading,
    };
};