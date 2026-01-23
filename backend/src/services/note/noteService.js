const Note = require('../../models/Note');

// service layer for note-related business logic
class NoteService {
    async createNote(noteData) {
        const note = new Note(noteData);
        return await note.save();
    }

    async getNoteById(id) {
        return await Note.findById(id);
    }

    async getNotesByUser(userId) {
        return await Note.find({ createdBy: userId }).sort({ createdAt: -1 });
    }

    async getSharedNotes(userId) {
        return await Note.find({ sharedWith: userId }).sort({ createdAt: -1 });
    }

    async updateNote(id, updateData) {
        return await Note.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );
    }

    async deleteNote(id) {
        return await Note.findByIdAndDelete(id);
    }

    async shareNote(noteId, userIds) {
        return await Note.findByIdAndUpdate(
            noteId,
            { $addToSet: { sharedWith: { $each: userIds } } },
            { new: true }
        );
    }

    async unshareNote(noteId, userId) {
        return await Note.findByIdAndUpdate(
            noteId,
            { $pull: { sharedWith: userId } },
            { new: true }
        );
    }

    async getNoteStats() {
        // aggregate notes by user
        return await Note.aggregate([
            {
                $group: {
                    _id: '$createdBy',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    username: '$user.username',
                    email: '$user.email',
                    count: 1
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
    }
}

module.exports = new NoteService();
