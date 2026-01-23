// api response types
export interface ApiResponse<T = any> {
    message: string;
    data?: T;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

// broadcast types
export interface Broadcast {
    _id: string;
    message: string;
    type: 'info' | 'warning' | 'alert';
    active: boolean;
    createdBy: string;
    createdAt: string;
    expiresAt?: string;
}

export interface ErrorResponse {
    error: string;
    message?: string;
    statusCode?: number;
}
