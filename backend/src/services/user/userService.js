const User = require('../../models/User');

// service layer for user-related business logic
// separates data access from controllers
class UserService {
    async getUserById(id) {
        return await User.findById(id).select('-password');
    }

    async getUserByEmail(email) {
        return await User.findOne({ email });
    }

    async getUserByUsername(username) {
        return await User.findOne({ username });
    }

    async updateUser(id, updateData) {
        // remove sensitive fields that shouldnt be updated directly
        delete updateData.password;
        delete updateData.role;
        delete updateData.verified;

        const user = await User.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        return user;
    }

    async updatePassword(id, newPasswordHash) {
        const user = await User.findByIdAndUpdate(
            id,
            { $set: { password: newPasswordHash } },
            { new: true }
        ).select('-password');

        return user;
    }

    async verifyUser(id) {
        return await User.findByIdAndUpdate(
            id,
            { $set: { verified: true } },
            { new: true }
        ).select('-password');
    }

    async unverifyUser(id) {
        return await User.findByIdAndUpdate(
            id,
            { $set: { verified: false } },
            { new: true }
        ).select('-password');
    }

    async deleteUser(id) {
        return await User.findByIdAndDelete(id);
    }

    /**
     * per GDPR NFR-9.1: fully erase user data + notes + files
     */
    async deleteFullAccount(userId, metadata = {}) {
        const mongoose = require('mongoose');
        const Note = require('../../models/Note');
        const SecurityLog = require('../../models/SecurityLog');
        const fs = require('fs');
        const path = require('path');

        // 1. Create a deletion log record first (so it can be anonymized too)
        await SecurityLog.create({
            event: 'user_deleted',
            user: userId,
            timestamp: new Date(),
            details: { ...metadata, reason: 'gdpr_deletion' },
            severity: 'critical'
        });

        // 2. Delete all notes owned by user
        await Note.deleteMany({ owner: userId });

        // 3. Remove user from all shared notes
        await Note.updateMany(
            { 'sharedWith.user': userId },
            { $pull: { sharedWith: { user: userId } } }
        );

        // 4. Delete upload directory
        const uploadDir = path.join(__dirname, '../../../uploads', userId.toString());
        if (fs.existsSync(uploadDir)) {
            fs.rmSync(uploadDir, { recursive: true, force: true });
        }

        // 5. Anonymize Security Logs (keep for audit but remove user link)
        await SecurityLog.updateMany(
            { user: userId },
            { $set: { user: null }, $push: { 'details.anonymized': true } }
        );

        // 6. Finally delete user
        return await User.findByIdAndDelete(userId);
    }

    async getAllUsers(filters = {}) {
        return await User.find(filters).select('-password');
    }
}

module.exports = new UserService();
