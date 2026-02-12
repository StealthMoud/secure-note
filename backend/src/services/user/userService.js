const User = require('../../models/User');

// user logic. keeps data access away from controllers.
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
        // block sensitive fields so they dont get changed by accident
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

    // gdpr stuff: kill everything related to the user.
    async deleteFullAccount(userId, metadata = {}) {
        const Note = require('../../models/Note');
        const SecurityLog = require('../../models/SecurityLog');
        const fs = require('fs').promises;
        const path = require('path');

        // backgrounded side effects
        SecurityLog.create({
            event: 'user_deleted',
            user: userId,
            timestamp: new Date(),
            details: { ...metadata, reason: 'gdpr_deletion' },
            severity: 'critical'
        }).catch(err => console.error('background log error:', err));

        // AWAIT note deletion to prevent orphan records, even if it adds slightly more latency to this rare operation
        await Note.deleteMany({ owner: userId });

        // remove them from notes shared by others
        Note.updateMany(
            { 'sharedWith.user': userId },
            { $pull: { sharedWith: { user: userId } } }
        ).catch(err => console.error('background note update error:', err));

        // nuke their upload folder asynchronusly
        const uploadDir = path.join(__dirname, '../../../uploads', userId.toString());
        try {
            await fs.rm(uploadDir, { recursive: true, force: true });
        } catch (err) {
            console.error('error removing upload dir:', err);
        }

        // clean user id from logs to keep them anonymized in background
        SecurityLog.updateMany(
            { user: userId },
            { $set: { user: null }, $push: { 'details.anonymized': true } }
        ).catch(err => console.error('background log anonymization error:', err));

        // finally kill the user record
        return await User.findByIdAndDelete(userId);
    }

    async getAllUsers(filters = {}) {
        return await User.find(filters).select('-password');
    }
}

module.exports = new UserService();
