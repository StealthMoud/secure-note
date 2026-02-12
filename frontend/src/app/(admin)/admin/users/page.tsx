'use client';

import {
    UsersIcon,
    ShieldCheckIcon,
    BellAlertIcon,
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useAdminUsers } from '@/features/admin/hooks/useAdminUsers';
import { UserTable } from '@/components/admin/UserTable';
import { UserFilters } from '@/components/admin/UserFilters';
import { UserBulkActions } from '@/components/admin/UserBulkActions';
import { AddUserForm } from '@/components/admin/AddUserForm';
import { UserActivitySection } from '@/components/admin/UserActivitySection';
import { AdminUserModals } from '@/components/admin/AdminUserModals';

export default function Page() {
    const {
        users,
        allUsers,
        setUsers,
        loading,
        notifications,
        searchTerm,
        setSearchTerm,
        currentPage,
        setCurrentPage,
        totalPages,
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
    } = useAdminUsers();

    const pendingCount = allUsers.filter(u => !u.verified).length;

    return (
        <div className="space-y-8 animate-fadeInShort pb-24">
            {/* page header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/10 rounded-xl">
                            <UsersIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600/60">User Management</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter italic">
                        Manage <span className="text-blue-600">Users</span>
                    </h1>
                </div>

                <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 p-1 rounded-2xl border border-white/5">
                    <div className="px-4 py-2 bg-white dark:bg-white/5 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Total Users</p>
                        <p className="text-xl font-black text-gray-900 dark:text-white">{allUsers.length}</p>
                    </div>
                    <div className="px-4 py-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Status</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">ONLINE</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* controls & filters */}
            <UserFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                pendingCount={pendingCount}
            />

            {/* content area */}
            <div className="min-h-[400px]">
                {currentTab === 'add-user' ? (
                    <AddUserForm
                        onUserCreated={(u) => setUsers(prev => [...prev, u])}
                        addNotification={addNotification}
                    />
                ) : currentTab === 'activity' ? (
                    <UserActivitySection
                        users={allUsers}
                        addNotification={addNotification}
                        adminContext={adminContext}
                    />
                ) : (
                    <>
                        <UserTable
                            users={users}
                            loading={loading}
                            selectedUsers={selectedUsers}
                            handleUserSelect={handleUserSelect}
                            handleSelectAll={handleSelectAll}
                            handleVerify={handleVerify}
                            handleDelete={handleDelete}
                            handleRoleUpdate={handleRoleUpdate}
                            adminContext={adminContext}
                        />

                        {/* pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-8">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    Page <span className="text-blue-600 font-mono">{currentPage}</span> of <span className="font-mono">{totalPages}</span>
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={currentPage === 1 || loading}
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                        className="p-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed group shadow-sm"
                                    >
                                        <ChevronLeftIcon className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:-translate-x-0.5 transition-transform" />
                                    </button>
                                    <button
                                        disabled={currentPage === totalPages || loading}
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        className="p-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed group shadow-sm"
                                    >
                                        <ChevronRightIcon className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* bulk actions bar */}
            <UserBulkActions
                selectedCount={selectedUsers.length}
                onClear={() => setSelectedUsers([])}
                onBulkVerify={handleBulkVerify}
                onBulkDelete={handleBulkDelete}
            />

            {/* confirmation modal */}
            <AdminUserModals
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                type="confirmation"
                modalConfig={modalConfig}
            />

            {/* notifications */}
            <div className="fixed bottom-8 right-8 z-[100] space-y-3">
                {notifications.map((notif) => (
                    <div
                        key={notif.id}
                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 ${notif.isExiting ? 'opacity-0 translate-x-12' : 'animate-slide-left'
                            } ${notif.type === 'error'
                                ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 shadow-rose-500/10'
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-emerald-500/10'
                            }`}
                    >
                        {notif.type === 'error' ? (
                            <BellAlertIcon className="w-5 h-5" />
                        ) : (
                            <ShieldCheckIcon className="w-5 h-5" />
                        )}
                        <p className="text-xs font-black uppercase tracking-widest">{notif.message}</p>
                        <button
                            onClick={() => dismissNotification(notif.id)}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors ml-2"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}