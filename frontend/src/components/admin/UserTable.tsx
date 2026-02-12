'use client';
import {
    CheckCircleIcon,
    ShieldCheckIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { User } from '@/types/user';

interface UserTableProps {
    users: User[];
    loading: boolean;
    selectedUsers: string[];
    handleUserSelect: (id: string) => void;
    handleSelectAll: (ids: string[]) => void;
    handleVerify: (id: string) => void;
    handleDelete: (id: string) => void;
    handleRoleUpdate: (id: string, role: 'user' | 'admin' | 'superadmin') => void;
    adminContext: any;
}

export const UserTable = ({
    users,
    loading,
    selectedUsers,
    handleUserSelect,
    handleSelectAll,
    handleVerify,
    handleDelete,
    handleRoleUpdate,
    adminContext
}: UserTableProps) => {

    const userIdsOnPage = users.map(u => u._id);
    const isAllSelected = users.length > 0 && selectedUsers.length === users.length;

    if (loading && users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 glass rounded-3xl border border-white/5">
                <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />
                <p className="text-gray-500 font-black text-xs uppercase tracking-[0.3em]">Loading users...</p>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="glass p-12 rounded-[2rem] text-center border-dashed border-gray-200 dark:border-white/10">
                <p className="text-gray-400 font-bold italic">No users found.</p>
            </div>
        );
    }

    return (
        <div className="glass rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl transition-all">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                            <th className="p-5 w-12 text-center">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={() => handleSelectAll(userIdsOnPage)}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                            </th>
                            <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest">User</th>
                            <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest">Role</th>
                            <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest">Joined</th>
                            <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="p-5 text-right text-xs font-black text-gray-400 uppercase tracking-widest w-24">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {users.map((user) => (
                            <tr
                                key={user._id}
                                className={`group transition-all hover:bg-gray-50/50 dark:hover:bg-white/[0.02] ${selectedUsers.includes(user._id) ? 'bg-blue-50/50 dark:bg-blue-500/5' : ''
                                    }`}
                            >
                                <td className="p-5 text-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(user._id)}
                                        onChange={() => handleUserSelect(user._id)}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                </td>
                                <td className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-blue-500/20">
                                                {user.username[0].toUpperCase()}
                                            </div>
                                            {user.verified && (
                                                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-0.5">
                                                    <CheckCircleIcon className="w-4 h-4 text-blue-500" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900 dark:text-white tracking-tight">{user.username}</p>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleUpdate(user._id, e.target.value as any)}
                                        disabled={
                                            (adminContext?.role !== 'superadmin' && user.role !== 'user') ||
                                            (adminContext?.user?._id === user._id && user.role === 'superadmin') // superadmin cant change own role at all since no higher
                                        }
                                        className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all ${user.role === 'superadmin' ? 'text-rose-600 bg-rose-500/5' :
                                            user.role === 'admin' ? 'text-purple-600 bg-purple-500/5' :
                                                'text-blue-600'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <option value="user" disabled={adminContext?.user?._id === user._id && (user.role === 'admin' || user.role === 'superadmin')}>User</option>
                                        <option value="admin" disabled={adminContext?.user?._id === user._id && user.role === 'superadmin'}>Admin</option>
                                        <option value="superadmin">Super Admin</option>
                                    </select>
                                </td>
                                <td className="p-5">
                                    <p className="text-[10px] font-mono text-gray-500 dark:text-gray-400">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </p>
                                </td>
                                <td className="p-5">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${user.verified ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                                            }`}>
                                            {user.verified ? 'Verified' : 'Unverified'}
                                        </span>
                                        {user.isTotpEnabled && (
                                            <ShieldCheckIcon className="w-4 h-4 text-emerald-500" title="2FA Active" />
                                        )}
                                    </div>
                                </td>
                                <td className="p-5 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                        {!user.verified && (
                                            <button
                                                onClick={() => handleVerify(user._id)}
                                                className="p-2 bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white rounded-xl transition-all"
                                                title="Verify User"
                                            >
                                                <ShieldCheckIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                        {adminContext?.user?._id !== user._id && (
                                            <button
                                                onClick={() => handleDelete(user._id)}
                                                className="p-2 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                                                title="Delete User"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
