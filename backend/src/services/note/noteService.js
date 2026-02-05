const Note = require('../../models/Note');
const User = require('../../models/User');
const {
    encryptSymmetric,
    decryptSymmetric,
    encryptText,
    decryptText,
    generateSymmetricKey
} = require('../../utils/encryption');

// service layer for note-related business logic with hybrid encryption
class NoteService {

    // Helper to decrypt a single note based on the user accessing it
    async _decryptNote(note, userId, userPrivateKey) {
        try {
            if (!note.encrypted || !note.encryptedData) return note;

            let encryptedKey;

            // 1. Determine which encrypted key to use
            if (note.owner.toString() === userId.toString() || (note.owner._id && note.owner._id.toString() === userId.toString())) {
                // User is owner
                encryptedKey = note.ownerEncryptedKey;
            } else {
                // User is a shared viewer/editor
                const shareEntry = note.sharedWith.find(s => s.user.toString() === userId.toString() || (s.user._id && s.user._id.toString() === userId.toString()));
                if (shareEntry) {
                    encryptedKey = shareEntry.encryptedKey;
                }
            }

            if (!encryptedKey) {
                // If we can't find a key, return the note as-is (encrypted) 
                return note;
            }

            // 2. Decrypt the Symmetric Key using User's Private Key
            const symmetricKey = decryptText(encryptedKey, userPrivateKey);

            // 3. Decrypt the Payload using the Symmetric Key
            const decryptedString = decryptSymmetric(note.encryptedData, symmetricKey);

            // 4. Return a "virtual" decrypted note object (don't save to DB!)
            const decryptedNote = note.toObject ? note.toObject() : { ...note };

            // Try to parse payload as JSON (New Format: {title, content})
            try {
                const payload = JSON.parse(decryptedString);
                decryptedNote.title = payload.title;
                decryptedNote.content = payload.content;
            } catch (e) {
                // Fallback for legacy data (content only)
                decryptedNote.content = decryptedString;
            }

            // Mask the encrypted fields for cleaner frontend response
            delete decryptedNote.encryptedData;
            delete decryptedNote.ownerEncryptedKey;

            return decryptedNote;

        } catch (error) {
            console.error(`Failed to decrypt note ${note._id}:`, error.message);
            // Fallback: return note with error content
            const errNote = note.toObject ? note.toObject() : { ...note };
            errNote.content = "[Error: Decryption Failed]";
            return errNote;
        }
    }

    async createNote(noteData, user) {
        // 1. Generate a new Symmetric Key (AES-256) for this note
        const symmetricKey = generateSymmetricKey();

        // 2. Encrypt the Payload (Title + Content)
        const payload = JSON.stringify({
            title: noteData.title,
            content: noteData.content || ''
        });
        const encryptedData = encryptSymmetric(payload, symmetricKey);

        // 3. Encrypt the Symmetric Key with the Owner's Public Key
        if (!user.publicKey) throw new Error('User public key required for encryption');
        const ownerEncryptedKey = encryptText(symmetricKey, user.publicKey);

        // 4. Save to Database
        const note = new Note({
            ...noteData,
            title: 'Encrypted Note', // Blind the server
            content: '',             // Blind the server
            encryptedData: encryptedData,
            ownerEncryptedKey: ownerEncryptedKey,
            encrypted: true,
            owner: user._id
        });

        const savedNote = await note.save();

        // Return decrypted version to the user immediately
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

    async getNotes(userId, user, filters = {}) {
        const { search, tag, isPinned } = filters;

        // 1. Fetch potential matches (Owner/Shared)
        let query = {
            $or: [{ owner: userId }, { 'sharedWith.user': userId }],
            deletedAt: null
        };

        // Filter metadata in DB (Performance optimization)
        if (tag) {
            query.tags = tag;
        }

        if (isPinned !== undefined) {
            query.isPinned = isPinned === 'true' || isPinned === true;
        }

        // Fetch ALL valid notes (blind fetch)
        const notes = await Note.find(query)
            .populate('owner', 'username email')
            .populate('sharedWith.user', 'username email')
            .sort({ isPinned: -1, createdAt: -1 });

        // 2. Decrypt ALL notes in memory
        const decryptedNotes = await Promise.all(notes.map(note => this._decryptNote(note, userId, user.privateKey)));

        // 3. Apply Content Search Logic (In-Memory)
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            return decryptedNotes.filter(note => {
                // Search in Decrypted Title, Content, and Tags
                return (
                    searchRegex.test(note.title) ||
                    searchRegex.test(note.content) ||
                    (note.tags && note.tags.some(t => searchRegex.test(t)))
                );
            });
        }

        return decryptedNotes;
    }

    // Legacy support if needed, or alias
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
        // 1. Fetch note to decrypt/prepare payload
        const note = await Note.findById(id);
        if (!note) return null;

        // 2. Optimistic Locking Check (Pre-computation)
        if (expectedVersion !== null && note.__v !== expectedVersion) {
            throw new Error('Conflict: Note has been modified by another user');
        }

        // If updating sensitive fields (title/content), we must re-encrypt the whole payload
        if (updateData.content !== undefined || updateData.title !== undefined) {

            let encryptedKeyToUnwrap = note.ownerEncryptedKey;

            // If user is NOT owner, find their key
            if (note.owner.toString() !== user._id.toString()) {
                const shareEntry = note.sharedWith.find(s => s.user.toString() === user._id.toString());
                if (!shareEntry) throw new Error('Access denied');
                encryptedKeyToUnwrap = shareEntry.encryptedKey;
            }

            const symmetricKey = decryptText(encryptedKeyToUnwrap, user.privateKey);

            // Get Current Payload
            const currentDecryptedString = decryptSymmetric(note.encryptedData, symmetricKey);
            let payload = { title: note.title, content: note.content }; // fallback defaults
            try {
                payload = JSON.parse(currentDecryptedString);
            } catch (e) {
                payload.content = currentDecryptedString; // legacy
                if (note.title !== 'Encrypted Note') payload.title = note.title;
            }

            // Apply Updates
            if (updateData.title !== undefined) payload.title = updateData.title;
            if (updateData.content !== undefined) payload.content = updateData.content;

            // Re-encrypt Payload
            const newPayloadStr = JSON.stringify(payload);
            const newEncryptedData = encryptSymmetric(newPayloadStr, symmetricKey);

            note.encryptedData = newEncryptedData;
            note.title = 'Encrypted Note'; // Ensure it stays blind
            note.content = '';
        }

        // Update other metadata in the object
        if (updateData.tags) note.tags = updateData.tags;
        if (updateData.isPinned !== undefined) note.isPinned = updateData.isPinned;
        if (updateData.format) note.format = updateData.format;

        // 3. atomic Save with Version Check and Increment
        // We use findOneAndUpdate to ensure the version hasn't changed since Step 2
        // If expectedVersion is not provided, we just increment based on current DB state (Last Write Wins behavior, but safer)

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
            $inc: { __v: 1 } // Atomic increment
        };

        const updatedNote = await Note.findOneAndUpdate(query, updates, { new: true });

        if (!updatedNote) {
            // If we found the note initially but this query returned null, it means version mismatch during the milliseconds of processing
            if (expectedVersion !== null) {
                throw new Error('Conflict: Note has been modified by another user');
            }
            return null; // Or unexpected deletion
        }

        // Return decrypted
        return await this._decryptNote(updatedNote, user._id, user.privateKey);
    }

    async deleteNote(id) {
        return await Note.findByIdAndDelete(id);
    }

    async shareNote(noteId, targetUserIds, ownerUser) {
        const note = await Note.findById(noteId);
        if (!note) throw new Error('Note not found');

        // 1. Decrypt the Symmetric Key using Owner's Private Key
        const symmetricKey = decryptText(note.ownerEncryptedKey, ownerUser.privateKey);

        const newShares = [];

        // 2. For each target user, Encrypt the Symmetric Key with CURRENT TARGET'S Public Key
        for (const targetId of targetUserIds) {
            const targetUser = await User.findById(targetId);
            if (!targetUser) continue;

            const encryptedKeyForTarget = encryptText(symmetricKey, targetUser.publicKey);

            newShares.push({
                user: targetId,
                permission: 'viewer', // default
                encryptedKey: encryptedKeyForTarget // Store the wrapped key!
            });
        }

        // 3. Update Note
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
