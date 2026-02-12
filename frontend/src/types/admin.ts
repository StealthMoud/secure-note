export interface Activity {
    notesCreated: number;
    sharedWith: string[];
    friendsList?: string[];
    adminActions?: number;
    broadcastsSent?: number;
    friendsAdded?: number;
}

export interface Broadcast {
    _id: string;
    message: string;
    type: 'info' | 'warning' | 'alert';
    active: boolean;
    createdBy: {
        _id: string;
        username: string;
    };
    createdAt: string;
    expiresAt?: string;
}

export interface SystemStats {
    totalUsers: number;
    verifiedUsers: number;
    totalNotes: number;
    pendingVerifications: number;
    cpuLoad: number;
    memoryPercentage: number;
    memoryUsage: string;
    uptime: string;
}

export interface NoteStat {
    _id: string;
    username: string;
    email: string;
    count: number;
}

// security log entry from the admin logs endpoint
export interface SecurityLog {
    _id: string;
    event: string;
    user: { _id: string; username: string; email: string } | null;
    timestamp: string;
    details: Record<string, unknown>;
    severity?: 'low' | 'medium' | 'high' | 'critical';
}

// paginated response for security logs
export interface LogsResponse {
    message: string;
    logs: SecurityLog[];
    total: number;
    pages: number;
    currentPage: number;
}

// response shape for admin stats endpoint
export interface StatsResponse {
    message: string;
    stats: SystemStats;
}
