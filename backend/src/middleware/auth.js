const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logSecurityEvent } = require('../utils/logger');

// check jwt secret at startup to prevent runtime errors
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be defined in environment variables');
}

// enhanced authentication middleware with security logging
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        await logSecurityEvent({
            event: 'authentication_failed',
            user: null,
            details: {
                reason: 'missing_or_malformed_header',
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                path: req.path,
            },
        });
        return res.status(401).json({ error: 'Authorization header missing or malformed' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // exclude sensitive fields when fetching user
        const user = await User.findById(decoded.id).select('-password -privateKey -totpSecret');

        if (!user) {
            await logSecurityEvent({
                event: 'authentication_failed',
                user: decoded.id,
                details: {
                    reason: 'user_not_found',
                    ip: req.ip,
                    userAgent: req.headers['user-agent'],
                    path: req.path,
                },
            });
            return res.status(401).json({ error: 'User not found' });
        }

        // check if token version matches user version (global logout support)
        if (typeof decoded.tokenVersion !== 'undefined' && decoded.tokenVersion !== user.tokenVersion) {
            await logSecurityEvent({
                event: 'authentication_failed',
                user: user._id,
                details: {
                    reason: 'token_revoked',
                    ip: req.ip,
                    userAgent: req.headers['user-agent']
                }
            });
            return res.status(401).json({ error: 'Session expired (password changed). Please log in again.' });
        }

        // attach full user context for authorization checks
        req.user = {
            id: user._id,
            _id: user._id, // for compatibility
            role: user.role || 'user',
            verified: user.verified,
            email: user.email,
            username: user.username,
        };

        next();
    } catch (err) {
        await logSecurityEvent({
            event: 'authentication_failed',
            user: null,
            details: {
                reason: err.name || 'invalid_token',
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                path: req.path,
                error: err.message,
            },
        });

        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token has expired, please log in again' });
        }
        return res.status(401).json({ error: 'Invalid token' });
    }
};

const ROLE_HIERARCHY = {
    'superadmin': 3,
    'admin': 2,
    'user': 0
};

// role authorization middleware (hierarchical)
const authorizeRole = (minRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
        const requiredLevel = ROLE_HIERARCHY[minRole] || 0;

        if (userLevel < requiredLevel) {
            logSecurityEvent({
                event: 'authorization_failed',
                user: req.user.id,
                details: {
                    reason: 'insufficient_permissions',
                    required_role: minRole,
                    user_role: req.user.role,
                    ip: req.ip,
                    path: req.path,
                },
            });
            return res.status(403).json({ error: `Access forbidden: requires ${minRole} privileges or higher` });
        }

        next();
    };
};

// backward compatibility wrapper
const authorizeAdmin = authorizeRole('admin');

// resource ownership verification middleware
const authorizeResourceOwner = (resourceType) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // admins can access all resources
        if (req.user.role === 'admin' || req.user.role === 'superadmin') {
            return next();
        }

        const resourceId = req.params.id || req.params.noteId || req.params.userId;

        try {
            let Model;
            switch (resourceType) {
                case 'note':
                    Model = require('../models/Note');
                    break;
                case 'user':
                    // for user resources, check if accessing own profile
                    if (resourceId === req.user.id.toString()) {
                        return next();
                    }
                    await logSecurityEvent({
                        event: 'authorization_failed',
                        user: req.user.id,
                        details: {
                            reason: 'not_resource_owner',
                            resource_type: resourceType,
                            resource_id: resourceId,
                            ip: req.ip,
                        },
                    });
                    return res.status(403).json({ error: 'Access forbidden: not authorized to access this resource' });
                default:
                    return res.status(500).json({ error: 'Invalid resource type' });
            }

            if (Model) {
                const resource = await Model.findById(resourceId);
                if (!resource) {
                    return res.status(404).json({ error: `${resourceType} not found` });
                }

                // check ownership or shared access
                const isOwner = resource.owner?.toString() === req.user.id.toString() ||
                    resource.createdBy?.toString() === req.user.id.toString();
                const hasSharedAccess = resource.sharedWith?.some(
                    entry => entry.user?.toString() === req.user.id.toString()
                );

                if (!isOwner && !hasSharedAccess) {
                    await logSecurityEvent({
                        event: 'authorization_failed',
                        user: req.user.id,
                        details: {
                            reason: 'not_resource_owner',
                            resource_type: resourceType,
                            resource_id: resourceId,
                            ip: req.ip,
                        },
                    });
                    return res.status(403).json({ error: 'Access forbidden: not authorized to access this resource' });
                }
            }

            next();
        } catch (err) {
            console.error('Authorization error:', err);
            return res.status(500).json({ error: 'Authorization check failed' });
        }
    };
};

// verified user middleware
const requireVerified = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.user.verified) {
        return res.status(403).json({ error: 'Email verification required' });
    }

    next();
};

module.exports = {
    authenticate,
    authorizeAdmin,
    authorizeRole,
    authorizeResourceOwner,
    requireVerified,
};