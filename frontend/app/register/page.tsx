'use client';
import { useState } from 'react';
import { registerUser } from '@/services/auth';
import Link from 'next/link';

export default function RegisterPage() {
    const [username, setUsername] = useState<string>(''); // Changed from name
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>(''); // Added
    const [error, setError] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            const data = await registerUser(username, email, password, confirmPassword);
            setMessage(data.message || 'Registration successful! Check your email to verify.');
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-md">
            <h1 className="text-2xl font-bold mb-4">Register</h1>
            <form onSubmit={handleRegister} className="space-y-4">
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="border p-2 w-full rounded"
                />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="border p-2 w-full rounded"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="border p-2 w-full rounded"
                />
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    className="border p-2 w-full rounded"
                />
                <button type="submit" className="bg-blue-500 text-white p-2 w-full rounded">Register</button>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {message && <p className="text-green-500 text-sm">{message}</p>}
            </form>
            <p className="mt-2 text-sm">
                Already have an account? <Link href="/login" className="text-blue-500">Login</Link>
            </p>
        </div>
    );
}