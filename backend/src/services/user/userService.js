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

    async getAllUsers(filters = {}) {
        return await User.find(filters).select('-password');
    }
}

module.exports = new UserService();
