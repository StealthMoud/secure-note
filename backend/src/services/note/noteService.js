const Note = require('../../models/Note');
const User = require('../../models/User');
const {
    aesEncrypt,
    aesDecrypt,
    rsaEncrypt,
    rsaDecrypt,
    generateSymmetricKey
} = require('../../utils/encryption');

// note business logic with hybrid encryption.
class NoteService {

    // helper to decrypt a single note. finds the right key for the user.
    async _decryptNote(note, userId, userPrivateKey) {
        try {
            if (!note.encrypted || !note.encryptedData) return note;

            let encryptedKey;

            // figure out which key to use. check if owner or shared.
            if (note.owner.toString() === userId.toString() || (note.owner._id && note.owner._id.toString() === userId.toString())) {
                // user is owner
                encryptedKey = note.ownerEncryptedKey;
            } else {
                // user is a shared viewer/editor
                const shareEntry = note.sharedWith.find(s => s.user.toString() === userId.toString() || (s.user._id && s.user._id.toString() === userId.toString()));
                if (shareEntry) {
                    encryptedKey = shareEntry.encryptedKey;
                }
            }

            if (!encryptedKey) {
                // if we cant find a key, just return note as-is (encrypted)
                return note;
            }

            // decrypt the symmetric key usin users private key
            const symmetricKey = rsaDecrypt(encryptedKey, userPrivateKey);

            // decrypt the payload with the symmetric key
            const decryptedString = aesDecrypt(note.encryptedData, symmetricKey);

            // return a "virtual" decrypted note object. dont save this to db!
            const decryptedNote = note.toObject ? note.toObject() : { ...note };

            // try to parse payload as json (new format: {title, content})
            try {
                const payload = JSON.parse(decryptedString);
                decryptedNote.title = payload.title;
                decryptedNote.content = payload.content;
            } catch (e) {
                // fallback for legacy data
                decryptedNote.content = decryptedString;
            }

            // mask encrypted fields so frontend is clean
            delete decryptedNote.encryptedData;
            delete decryptedNote.ownerEncryptedKey;

            return decryptedNote;

        } catch (error) {
            console.error(`failed to decrypt note ${note._id}:`, error.message);
            // fallback: return note with error content
            const errNote = note.toObject ? note.toObject() : { ...note };
            errNote.content = "[error: decryption failed]";
            return errNote;
        }
    }

    async createNote(noteData, user) {
        // generate a new symmetric key for this note
        const symmetricKey = generateSymmetricKey();

        // encrypt the payload (title + content)
        const payload = JSON.stringify({
            title: noteData.title,
            content: noteData.content || ''
        });
        const encryptedData = aesEncrypt(payload, symmetricKey);

        // encrypt the symmetric key with the owners public key
        if (!user.publicKey) throw new Error('user public key required for encryption');
        const ownerEncryptedKey = rsaEncrypt(symmetricKey, user.publicKey);

        // save to db
        const note = new Note({
            ...noteData,
            title: 'Encrypted Note', // blind the server
            content: '',             // blind the server
            encryptedData: encryptedData,
            ownerEncryptedKey: ownerEncryptedKey,
            encrypted: true,
            owner: user._id
        });

        const savedNote = await note.save();

        // return decrypted version to user immediately
        const result = savedNote.toObject();
        result.title = noteData.title;
        result.content = noteData.content;
        return result;
    }

    async getNoteById(id, user) {
        const note = await Note.findById(id).populate('owner', 'username email').populate('sharedWith.user', 'username email');
        if (!note) return null;

        return await this._decryptNote(note, user._id, user.privateKey);
    }

    async countNotes(userId, filters = {}) {
        const { tag, isPinned } = filters;
        let query = {
            owner: userId,
            deletedAt: null
        };

        if (tag) query.tags = tag;
        if (isPinned !== undefined) query.isPinned = isPinned === 'true' || isPinned === true;

        return await Note.countDocuments(query);
    }

    async getNotes(userId, user, filters = {}) {
        const { search, tag, isPinned } = filters;

        // find matches (owner or shared)
        let query = {
            $or: [{ owner: userId }, { 'sharedWith.user': userId }],
            deletedAt: null
        };

        // filter metadata in db
        if (tag) {
            query.tags = tag;
        }

        if (isPinned !== undefined) {
            query.isPinned = isPinned === 'true' || isPinned === true;
        }

        // fetch all valid notes
        const notes = await Note.find(query)
            .populate('owner', 'username email')
            .populate('sharedWith.user', 'username email')
            .sort({ isPinned: -1, createdAt: -1 });

        // decrypt everything in memory
        const decryptedNotes = await Promise.all(notes.map(note => this._decryptNote(note, userId, user.privateKey)));

        // apply content search logic in memory
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            return decryptedNotes.filter(note => {
                // search in decrypted title, content, and tags
                return (
                    searchRegex.test(note.title) ||
                    searchRegex.test(note.content) ||
                    (note.tags && note.tags.some(t => searchRegex.test(t)))
                );
            });
        }

        return decryptedNotes;
    }

    // alias for support
    async getNotesByUser(userId, user) {
        return this.getNotes(userId, user);
    }

    async getSharedNotes(userId, user) {
        const notes = await Note.find({ 'sharedWith.user': userId })
            .populate('owner', 'username')
            .sort({ createdAt: -1 });

        return await Promise.all(notes.map(note => this._decryptNote(note, userId, user.privateKey)));
    }

    async updateNote(id, updateData, user, expectedVersion = null) {
        // fetch note to prepare update
        const note = await Note.findById(id);
        if (!note) return null;

        // optimistic locking check
        if (expectedVersion !== null && note.__v !== expectedVersion) {
            throw new Error('conflict: note has been modified by another user');
        }

        // if updating title or content we gotta re-encrypt everything
        if (updateData.content !== undefined || updateData.title !== undefined) {

            let encryptedKeyToUnwrap = note.ownerEncryptedKey;

            // if not owner, find the shared key
            if (note.owner.toString() !== user._id.toString()) {
                const shareEntry = note.sharedWith.find(s => s.user.toString() === user._id.toString());
                if (!shareEntry) throw new Error('access denied');
                encryptedKeyToUnwrap = shareEntry.encryptedKey;
            }

            const symmetricKey = rsaDecrypt(encryptedKeyToUnwrap, user.privateKey);

            // get current payload
            const currentDecryptedString = aesDecrypt(note.encryptedData, symmetricKey);
            let payload = { title: note.title, content: note.content }; // fallback
            try {
                payload = JSON.parse(currentDecryptedString);
            } catch (e) {
                payload.content = currentDecryptedString; // legacy
                if (note.title !== 'Encrypted Note') payload.title = note.title;
            }

            // apply updates
            if (updateData.title !== undefined) payload.title = updateData.title;
            if (updateData.content !== undefined) payload.content = updateData.content;

            // re-encrypt payload
            const newPayloadStr = JSON.stringify(payload);
            const newEncryptedData = aesEncrypt(newPayloadStr, symmetricKey);

            note.encryptedData = newEncryptedData;
            note.title = 'Encrypted Note'; // keep it blind
            note.content = '';
        }

        // update metadata
        if (updateData.tags) note.tags = updateData.tags;
        if (updateData.isPinned !== undefined) note.isPinned = updateData.isPinned;
        if (updateData.format) note.format = updateData.format;

        // OPTIMISTIC LOCKING: 
        // We include the version (__v) in the query to ensure we only update
        // if the note hasn't changed since we first fetched it at line 185.
        const query = { _id: id };
        if (expectedVersion !== null) {
            query.__v = expectedVersion;
        }

        const updates = {
            $set: {
                title: note.title,
                content: note.content,
                encryptedData: note.encryptedData,
                tags: note.tags,
                isPinned: note.isPinned,
                format: note.format
            },
            $inc: { __v: 1 } // atomically increment the version for the next person
        };

        const updatedNote = await Note.findOneAndUpdate(query, updates, { new: true });

        if (!updatedNote) {
            // version mismatch happened while processin
            if (expectedVersion !== null) {
                throw new Error('conflict: note has been modified by another user');
            }
            return null;
        }

        // return decrypted
        return await this._decryptNote(updatedNote, user._id, user.privateKey);
    }

    async deleteNote(id) {
        return await Note.findByIdAndDelete(id);
    }

    async shareNote(noteId, targetUserIds, ownerUser) {
        const note = await Note.findById(noteId);
        if (!note) throw new Error('note not found');

        // decrypt the symmetric key usin owners private key
        const symmetricKey = rsaDecrypt(note.ownerEncryptedKey, ownerUser.privateKey);

        const newShares = [];

        // encrypt the symmetric key with each targets public key
        for (const targetId of targetUserIds) {
            const targetUser = await User.findById(targetId);
            if (!targetUser) continue;

            const encryptedKeyForTarget = rsaEncrypt(symmetricKey, targetUser.publicKey);

            newShares.push({
                user: targetId,
                permission: 'viewer', // default
                encryptedKey: encryptedKeyForTarget // store the wrapped key!
            });
        }

        // update note with new shares
        const updatedNote = await Note.findByIdAndUpdate(
            noteId,
            { $push: { sharedWith: { $each: newShares } } },
            { new: true }
        ).populate('sharedWith.user', 'username email');

        return updatedNote;
    }

    async unshareNote(noteId, userId) {
        return await Note.findByIdAndUpdate(
            noteId,
            { $pull: { sharedWith: { user: userId } } },
            { new: true }
        );
    }

    async getNoteStats() {
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
