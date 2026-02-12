'use client';
import { useState, useEffect, useCallback } from 'react';
import {
    getUsers,
    deleteUser,
    verifyUser,
    bulkDeleteUsers,
    bulkVerifyUsers,
    updateUserRole,
} from '@/services/adminService';
import { useDashboardSharedContext } from '@/context/DashboardSharedContext';
import { useAdminNotifications } from './useAdminNotifications';
import { User } from '@/types/user';

export const useAdminUsers = () => {
    const { user: adminContext } = useDashboardSharedContext();
    const { notifications, addNotification, dismissNotification } = useAdminNotifications();
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [currentTab, setCurrentTab] = useState<'all-users' | 'pending-verifications' | 'admins' | 'add-user' | 'activity'>('all-users');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    // modal state for confirmations
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        action: () => Promise<void>;
        type: 'danger' | 'warning';
    }>({
        isOpen: false,
        title: '',
        message: '',
        action: async () => { },
        type: 'warning'
    });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getUsers({
                page: 1,
                limit: 1000,
            });
            setAllUsers(data.users);
        } catch (err: any) {
            addNotification(err.message || 'failed to load users', 'error');
        } finally {
            setLoading(false);
        }
    }, [addNotification]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // client-side filtering based on tab and search
    const filteredUsers = allUsers.filter(user => {
        // tab filter
        if (currentTab === 'all-users' && user.role !== 'user') return false;
        if (currentTab === 'pending-verifications' && user.verified) return false;
        if (currentTab === 'admins' && user.role === 'user') return false;

        // search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (
                user.username.toLowerCase().includes(term) ||
                user.email.toLowerCase().includes(term) ||
                (user.firstName && user.firstName.toLowerCase().includes(term)) ||
                (user.lastName && user.lastName.toLowerCase().includes(term))
            );
        }

        return true;
    });

    // client-side pagination
    const ITEMS_PER_PAGE = 10;
    const computedTotalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // reset to page 1 when tab or search changes
    useEffect(() => {
        setCurrentPage(1);
        setSelectedUsers([]);
    }, [currentTab, searchTerm]);

    const handleDelete = async (userId: string) => {
        setModalConfig({
            isOpen: true,
            title: 'Delete User?',
            message: 'this will permanently delete this user and all their data. this action cannot be undone.',
            type: 'danger',
            action: async () => {
                try {
                    await deleteUser(userId);
                    setAllUsers(prev => prev.filter(u => u._id !== userId));
                    addNotification('user deleted successfully');
                } catch (err: any) {
                    addNotification(err.message || 'failed to delete user', 'error');
                }
            }
        });
    };

    const handleVerify = async (userId: string) => {
        try {
            await verifyUser(userId);
            setAllUsers(prev => prev.map(u => u._id === userId ? { ...u, verified: true } : u));
            addNotification('user verified successfully');
        } catch (err: any) {
            addNotification(err.message || 'verification failed', 'error');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedUsers.length === 0) return;
        setModalConfig({
            isOpen: true,
            title: 'Delete Selected Users?',
            message: `you are about to delete ${selectedUsers.length} users. all their data will be removed. continue?`,
            type: 'danger',
            action: async () => {
                try {
                    await bulkDeleteUsers(selectedUsers);
                    setAllUsers(prev => prev.filter(u => !selectedUsers.includes(u._id)));
                    setSelectedUsers([]);
                    addNotification(`${selectedUsers.length} users deleted`);
                } catch (err: any) {
                    addNotification(err.message || 'bulk delete failed', 'error');
                }
            }
        });
    };

    const handleBulkVerify = async () => {
        if (selectedUsers.length === 0) return;
        try {
            await bulkVerifyUsers(selectedUsers);
            setAllUsers(prev => prev.map(u => selectedUsers.includes(u._id) ? { ...u, verified: true } : u));
            setSelectedUsers([]);
            addNotification(`${selectedUsers.length} users verified`);
        } catch (err: any) {
            addNotification(err.message || 'bulk verification failed', 'error');
        }
    };

    const handleUserSelect = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleSelectAll = (userIdsOnPage: string[]) => {
        if (selectedUsers.length === userIdsOnPage.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(userIdsOnPage);
        }
    };

    const handleRoleUpdate = async (userId: string, newRole: 'user' | 'admin' | 'superadmin') => {
        try {
            await updateUserRole(userId, newRole);
            setAllUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
            addNotification('user role updated successfully');
        } catch (err: any) {
            addNotification(err.message || 'role update failed', 'error');
        }
    };

    return {
        users: paginatedUsers,
        allUsers,
        setUsers: setAllUsers,
        loading,
        notifications,
        searchTerm,
        setSearchTerm,
        currentPage,
        setCurrentPage,
        totalPages: computedTotalPages,
        currentTab,
        setCurrentTab,
        selectedUsers,
        setSelectedUsers,
        modalConfig,
        setModalConfig,
        addNotification,
        dismissNotification,
        handleDelete,
        handleVerify,
        handleBulkDelete,
        handleBulkVerify,
        handleUserSelect,
        handleSelectAll,
        handleRoleUpdate,
        adminContext
    };
};
