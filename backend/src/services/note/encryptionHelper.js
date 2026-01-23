const { encryptText, decryptText, encryptSymmetric, decryptSymmetric } = require('../../utils/encryption');

/**
 * note encryption helper functions
 * extracts common encryption/decryption patterns from noteController
 */

/**
 * decrypt note content for owner
 * @param {Object} note - note document
 * @param {Object} user - user document with privateKey
 * @returns {Object} decrypted note data {title, content, format}
 */
const decryptNoteForOwner = (note, user) => {
    try {
        if (!note.encrypted || !note.ownerEncryptedKey || !note.encryptedData) {
            return { title: note.title, content: note.content, format: note.format };
        }

        const symmetricKey = decryptText(note.ownerEncryptedKey, user.privateKey);
        const decryptedDataJSON = decryptSymmetric(note.encryptedData, symmetricKey);
        const decryptedData = JSON.parse(decryptedDataJSON);

        return {
            title: decryptedData.title,
            content: decryptedData.content,
            format: decryptedData.format
        };
    } catch (error) {
        console.error('error decrypting note for owner:', error);
        return {
            title: '[decryption failed]',
            content: '[decryption failed]',
            format: 'plain'
        };
    }
};

/**
 * decrypt note content for shared user
 * @param {Object} note - note document
 * @param {Object} user - user document with privateKey
 * @param {string} userId - user id to find shared entry
 * @returns {Object} decrypted note data {title, content, format}
 */
const decryptNoteForSharedUser = (note, user, userId) => {
    try {
        const sharedEntry = note.sharedWith.find(
            entry => (entry.user._id || entry.user).toString() === userId
        );

        if (!sharedEntry || !sharedEntry.encryptedKey || !note.encryptedData) {
            if (note.encrypted) {
                return {
                    title: '[access denied]',
                    content: '[access denied]',
                    format: 'plain'
                };
            }
            return { title: note.title, content: note.content, format: note.format };
        }

        const symmetricKey = decryptText(sharedEntry.encryptedKey, user.privateKey);
        const decryptedDataJSON = decryptSymmetric(note.encryptedData, symmetricKey);
        const decryptedData = JSON.parse(decryptedDataJSON);

        return {
            title: decryptedData.title,
            content: decryptedData.content,
            format: decryptedData.format
        };
    } catch (error) {
        console.error('error decrypting shared note:', error);
        return {
            title: '[decryption failed]',
            content: '[decryption failed]',
            format: 'plain'
        };
    }
};

/**
 * decrypt note based on user relationship (owner or shared)
 * @param {Object} noteObj - note object
 * @param {Object} user - user document
 * @param {string} userId - current user id
 * @returns {Object} note object with decrypted content
 */
const decryptNoteForUser = (noteObj, user, userId) => {
    let decryptedData;

    const ownerId = (noteObj.owner._id || noteObj.owner).toString();
    if (ownerId === userId.toString()) {
        decryptedData = decryptNoteForOwner(noteObj, user);
    } else {
        decryptedData = decryptNoteForSharedUser(noteObj, user, userId.toString());
    }

    return {
        ...noteObj,
        title: decryptedData.title,
        content: decryptedData.content,
        format: decryptedData.format
    };
};

/**
 * encrypt note data with symmetric key
 * @param {Object} data - data to encrypt {title, content, format}
 * @param {string} symmetricKey - aes symmetric key
 * @returns {string} encrypted data
 */
const encryptNoteData = (data, symmetricKey) => {
    const dataJSON = JSON.stringify(data);
    return encryptSymmetric(dataJSON, symmetricKey);
};

/**
 * re-encrypt note data during update
 * @param {Object} note - existing note document
 * @param {Object} user - user document with privateKey
 * @param {Object} updates - fields to update {title, content, format}
 * @returns {string} new encrypted data
 */
const reEncryptNoteData = (note, user, updates) => {
    try {
        let symmetricKey;
        const userIdStr = (user._id || user).toString();
        const ownerIdStr = (note.owner._id || note.owner).toString();

        if (ownerIdStr === userIdStr) {
            symmetricKey = decryptText(note.ownerEncryptedKey, user.privateKey);
        } else {
            const sharedEntry = note.sharedWith.find(
                entry => (entry.user._id || entry.user).toString() === userIdStr
            );
            if (!sharedEntry || sharedEntry.permission !== 'editor') {
                throw new Error('insufficient permissions to re-encrypt note');
            }
            symmetricKey = decryptText(sharedEntry.encryptedKey, user.privateKey);
        }

        // decrypt existing data to merge with updates
        const currentDataJSON = decryptSymmetric(note.encryptedData, symmetricKey);
        const currentData = JSON.parse(currentDataJSON);

        const newData = {
            title: updates.title !== undefined ? updates.title : currentData.title,
            content: updates.content !== undefined ? updates.content : currentData.content,
            format: updates.format !== undefined ? updates.format : currentData.format
        };

        return encryptNoteData(newData, symmetricKey);
    } catch (error) {
        console.error('error re-encrypting note data:', error);
        throw new Error('failed to re-encrypt note data');
    }
};

module.exports = {
    decryptNoteForOwner,
    decryptNoteForSharedUser,
    decryptNoteForUser,
    encryptNoteData,
    reEncryptNoteData
};
