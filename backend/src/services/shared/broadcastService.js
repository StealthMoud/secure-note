const Broadcast = require('../../models/Broadcast');

// service layer for broadcast-related business logic
class BroadcastService {
    async createBroadcast(broadcastData) {
        const broadcast = new Broadcast(broadcastData);
        return await broadcast.save();
    }

    async getActiveBroadcast() {
        return await Broadcast.findOne({ active: true }).sort({ createdAt: -1 });
    }

    async getAllBroadcasts() {
        return await Broadcast.find().sort({ createdAt: -1 });
    }

    async getBroadcastById(id) {
        return await Broadcast.findById(id);
    }

    async deactivateBroadcast(id) {
        return await Broadcast.findByIdAndUpdate(
            id,
            { $set: { active: false } },
            { new: true }
        );
    }

    async deleteBroadcast(id) {
        return await Broadcast.findByIdAndDelete(id);
    }
}

module.exports = new BroadcastService();
