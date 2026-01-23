// application-wide constants

// http status codes
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500
};

// user roles
const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin'
};

// note permissions
const NOTE_PERMISSIONS = {
    VIEWER: 'viewer',
    EDITOR: 'editor'
};

// security log event types
const SECURITY_EVENTS = {
    LOGIN_SUCCESS: 'login_success',
    LOGIN_FAILURE: 'login_failure',
    LOGOUT: 'logout',
    PASSWORD_CHANGE: 'password_change',
    EMAIL_CHANGE: 'email_change',
    TOTP_ENABLED: 'totp_enabled',
    TOTP_DISABLED: 'totp_disabled',
    TOTP_VERIFIED: 'totp_verified',
    ACCOUNT_DELETED: 'account_deleted',
    SUSPICIOUS_ACTIVITY: 'suspicious_activity'
};

// error messages
const ERROR_MESSAGES = {
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    NOT_FOUND: 'Resource not found',
    INVALID_CREDENTIALS: 'Invalid credentials',
    USER_EXISTS: 'User already exists',
    INVALID_TOKEN: 'Invalid or expired token',
    VALIDATION_ERROR: 'Validation error',
    SERVER_ERROR: 'Internal server error'
};

// token expiration times
const TOKEN_EXPIRY = {
    ACCESS_TOKEN: '1h',
    REFRESH_TOKEN: '7d',
    VERIFICATION_TOKEN: '24h',
    RESET_TOKEN: '1h'
};

module.exports = {
    HTTP_STATUS,
    USER_ROLES,
    NOTE_PERMISSIONS,
    SECURITY_EVENTS,
    ERROR_MESSAGES,
    TOKEN_EXPIRY
};
