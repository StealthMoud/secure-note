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



export interface ErrorResponse {
    error: string;
    message?: string;
    statusCode?: number;
}
