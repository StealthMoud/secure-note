import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// create axios instance with base url and default settings
export const api = axios.create({
    baseURL: `${API_URL}/api`,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // critical for refresh token cookie
});

// flag to avoid loop if refresh also fails
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

// attach token to every request automatically
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// handle 401 errors by attempting to refresh token + centralize error extraction
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // handle 401 refresh logic
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // post to refresh which uses httponly cookie on backend
                const { data } = await axios.post(`${API_URL}/api/auth/refresh`, {}, { withCredentials: true });
                const newToken = (data as any).token;

                localStorage.setItem('token', newToken);
                api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                }

                processQueue(null, newToken);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                // if refresh fails redirect to login
                localStorage.removeItem('token');
                if (typeof window !== 'undefined') window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // centralize error message extraction
        let errorMessage = 'An unexpected error occurred';
        let fieldErrors: Record<string, string> | undefined;

        if (error.response?.status === 429) {
            errorMessage = "You're doing that too often. Please wait a moment before trying again.";
        } else if (error.response?.data?.errors) {
            errorMessage = error.response.data.errors.map((err: any) => err.msg).join('; ');
            fieldErrors = {};
            error.response.data.errors.forEach((err: any) => {
                fieldErrors![err.path || err.param] = err.msg;
            });
        } else {
            errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || errorMessage;
        }

        const finalError = new Error(errorMessage) as any;
        if (fieldErrors) finalError.fieldErrors = fieldErrors;
        // keep reference to original response for debugging in components if needed
        finalError.response = error.response;

        return Promise.reject(finalError);
    }
);

export default api;