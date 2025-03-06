import React, { useState } from 'react';
import { registerUser } from '../services/auth';

const RegisterPage = () => {
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await registerUser(name, email, password);
            alert('Registration successful!');
        } catch (error: any) {
            alert(error.response.data.message || 'Registration failed');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl mb-4">Register</h1>
            <form onSubmit={handleRegister} className="space-y-4">
                <input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} className="border p-2 w-full" />
                <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} className="border p-2 w-full" />
                <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} className="border p-2 w-full" />
                <button type="submit" className="bg-blue-500 text-white p-2 w-full">Register</button>
            </form>
        </div>
    );
};

export default RegisterPage;
