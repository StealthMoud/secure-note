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
        logSecurityEvent({
            event: 'authentication_failed',
            user: null,
            details: {
                reason: 'missing_or_malformed_header',
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                path: req.path,
            },
        }).catch(err => console.error('background log error:', err));
        return res.status(401).json({ error: 'Authorization header missing or malformed' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // exclude sensitive fields when fetching user
        const user = await User.findById(decoded.id).select('-password -privateKey -totpSecret');

        if (!user) {
            logSecurityEvent({
                event: 'authentication_failed',
                user: decoded.id,
                details: {
                    reason: 'user_not_found',
                    ip: req.ip,
                    userAgent: req.headers['user-agent'],
                    path: req.path,
                },
            }).catch(err => console.error('background log error:', err));
            return res.status(401).json({ error: 'User not found' });
        }

        // check if token version matches user version (global logout support)
        if (typeof decoded.tokenVersion !== 'undefined' && decoded.tokenVersion !== user.tokenVersion) {
            logSecurityEvent({
                event: 'authentication_failed',
                user: user._id,
                details: {
                    reason: 'token_revoked',
                    ip: req.ip,
                    userAgent: req.headers['user-agent']
                }
            }).catch(err => console.error('background log error:', err));
            return res.status(401).json({ error: 'Session expired (password changed). Please log in again.' });
        }

        // attach full user context for authorization checks
        req.user = {
            id: user._id,
            _id: user._id, // i add both id and _id so nothing breaks if code uses the other one
            role: user.role || 'user',
            verified: user.verified,
            email: user.email,
            username: user.username,
        };

        next();
    } catch (err) {
        logSecurityEvent({
            event: 'authentication_failed',
            user: null,
            details: {
                reason: err.name || 'invalid_token',
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                path: req.path,
                error: err.message,
            },
        }).catch(error => console.error('background log error:', error));

        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token has expired, please log in again' });
        }
        return res.status(401).json({ error: 'Invalid token' });
    }
};

const ROLE_HIERARCHY = {
    'superadmin': 2,
    'admin': 1,
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

// role levels: 0=user, 1=admin, 2=superadmin. minRole checks if your level is >= that.
const authorizeAdmin = authorizeRole('admin'); // keepin this for now to avoid breakin too many imports, but i should use authorizeRole directly
const authorizeSuperAdmin = authorizeRole('superadmin');

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
                    // let people look at their own profile. if its someone else, we block n log it.
                    if (resourceId === req.user.id.toString()) {
                        return next();
                    }
                    logSecurityEvent({
                        event: 'authorization_failed',
                        user: req.user.id,
                        details: {
                            reason: 'not_resource_owner',
                            resource_type: resourceType,
                            resource_id: resourceId,
                            ip: req.ip,
                        },
                    }).catch(err => console.error('background log error:', err));
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
                    logSecurityEvent({
                        event: 'authorization_failed',
                        user: req.user.id,
                        details: {
                            reason: 'not_resource_owner',
                            resource_type: resourceType,
                            resource_id: resourceId,
                            ip: req.ip,
                        },
                    }).catch(err => console.error('background log error:', err));
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
    authorizeRole,
    authorizeAdmin,
    authorizeSuperAdmin,
    authorizeResourceOwner,
    requireVerified,
};