'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { useDebounce } from '@/hooks/useDebounce';
import { useAdminNotifications } from './useAdminNotifications';
import { SecurityLog, LogsResponse } from '@/types/admin';

export const useSecurityLogs = () => {
    const [logs, setLogs] = useState<SecurityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const { notifications, addNotification, dismissNotification, cleanup } = useAdminNotifications();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [severityFilter, setSeverityFilter] = useState<string>('');
    const [expandedLog, setExpandedLog] = useState<string | null>(null);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await api.get<LogsResponse>('/admin/logs', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: currentPage,
                    limit: 10,
                    severity: severityFilter || undefined,
                    search: debouncedSearchTerm || undefined
                }
            });
            setLogs(response.data.logs);
            setTotalPages(response.data.pages);
        } catch (err: any) {
            addNotification(err.response?.data?.error || 'failed to sync intelligence stream');
        } finally {
            setLoading(false);
        }
    }, [currentPage, severityFilter, debouncedSearchTerm, addNotification]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    useEffect(() => {
        return () => cleanup();
    }, [cleanup]);

    const handleExport = async (format: 'csv' | 'pdf') => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.get(`/admin/logs/export`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { format, severity: severityFilter || undefined },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `intel_export_${Date.now()}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err: any) {
            addNotification('export protocol failed');
        }
    };

    return {
        logs,
        loading,
        notifications,
        searchTerm,
        setSearchTerm,
        currentPage,
        setCurrentPage,
        totalPages,
        severityFilter,
        setSeverityFilter,
        expandedLog,
        setExpandedLog,
        handleExport,
        dismissNotification
    };
};
