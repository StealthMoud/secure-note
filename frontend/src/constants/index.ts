// application-wide constants
// keeps magic strings and config values in one place

// api configuration
export const API_CONFIG = {
    BASE_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
} as const;

// route paths
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    NOTES: '/notes',
    FRIENDS: '/friends',
    PROFILE: '/profile',
    SETTINGS: '/account-settings',
    ADMIN: '/admin',
    ADMIN_USERS: '/admin/users',
    ADMIN_LOGS: '/admin/security-logs',
    ADMIN_BROADCASTS: '/admin/broadcasts',
} as const;

// user roles
export const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin',
} as const;

// note permissions
export const NOTE_PERMISSIONS = {
    VIEWER: 'viewer',
    EDITOR: 'editor',
} as const;

// broadcast types
export const BROADCAST_TYPES = {
    INFO: 'info',
    WARNING: 'warning',
    ALERT: 'alert',
} as const;

// validation rules
export const VALIDATION = {
    USERNAME_MIN: 3,
    USERNAME_MAX: 30,
    PASSWORD_MIN: 8,
    BIO_MAX: 500,
    NICKNAME_MIN: 2,
    NICKNAME_MAX: 50,
    NOTE_TITLE_MAX: 200,
    TAG_MAX: 30,
} as const;

// error messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'network error - please check your connection',
    UNAUTHORIZED: 'unauthorized - please login again',
    FORBIDDEN: 'you dont have permission to do that',
    NOT_FOUND: 'resource not found',
    SERVER_ERROR: 'server error - please try again later',
    VALIDATION_ERROR: 'invalid input - please check your data',
} as const;

// success messages
export const SUCCESS_MESSAGES = {
    LOGIN: 'logged in successfully',
    LOGOUT: 'logged out successfully',
    REGISTER: 'account created successfully',
    UPDATE_PROFILE: 'profile updated successfully',
    UPDATE_PASSWORD: 'password updated successfully',
    NOTE_CREATED: 'note created successfully',
    NOTE_UPDATED: 'note updated successfully',
    NOTE_DELETED: 'note deleted successfully',
} as const;

// local storage keys
export const STORAGE_KEYS = {
    TOKEN: 'token',
    THEME: 'theme',
    REMEMBER_ME: 'rememberMe',
    SAVED_IDENTIFIER: 'savedIdentifier',
    DISMISSED_BROADCAST: 'dismissedBroadcast',
} as const;

// theme values
export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
} as const;
