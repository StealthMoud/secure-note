'use client';
import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { createUser } from '@/services/adminService';

interface AddUserFormProps {
    onUserCreated: (user: any) => void;
    addNotification: (message: string, type: 'error' | 'success') => void;
}

export const AddUserForm = ({ onUserCreated, addNotification }: AddUserFormProps) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'user' as 'user' | 'admin'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await createUser(formData);
            onUserCreated(response.user);
            addNotification('user created successfully', 'success');
            setFormData({ username: '', email: '', password: '', role: 'user' });
        } catch (err: any) {
            const errorMessage = err.message || 'failed to create user';
            // handle detailed field errors if available
            const detailedError = err.fieldErrors
                ? Object.values(err.fieldErrors).join('. ')
                : errorMessage;
            addNotification(detailedError, 'error');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto glass p-8 rounded-[2rem] border border-white/10 shadow-2xl animate-fadeInShort">
            <div className="mb-8">
                <h3 className="text-xl font-black text-gray-900 dark:text-white italic tracking-tighter">Add <span className="text-blue-600">New User</span></h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Create a new user account.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Username</label>
                    <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full p-4 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-bold"
                        placeholder="username"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-4 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-bold"
                        placeholder="user@example.com"
                        required
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full p-4 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-bold"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'admin' })}
                            className="w-full p-4 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                className="w-full py-4 mt-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
                <PlusIcon className="w-5 h-5" />
                Create User
            </button>
        </form>
    );
};
