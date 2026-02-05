const mongoose = require('mongoose');
const User = require('../../backend/src/models/User');
const Note = require('../../backend/src/models/Note');
const noteService = require('../../backend/src/services/note/noteService');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const getMongoUri = () => {
    let uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/secure-note';
    // replace 'mongodb' host with 'localhost' for local script execution
    return uri.replace('mongodb://mongodb:', 'mongodb://localhost:');
};

const DB_URI = getMongoUri();

// Helper to generate keys
const genKeys = () => crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

async function runSharedConcurrencyTest() {
    console.log('--- Verification: Shared Note Concurrent Editing ---');

    let conn;
    try {
        conn = await mongoose.connect(DB_URI);

        // 1. Setup Users (Owner & Friend)
        await User.deleteMany({ username: { $in: ['alice_owner', 'bob_friend'] } });

        const keysA = genKeys();
        const alice = await User.create({
            username: 'alice_owner',
            email: 'alice@test.com',
            password: 'password123',
            publicKey: keysA.publicKey,
            privateKey: keysA.privateKey,
            verified: true,
            friends: [] // Will populate
        });

        const keysB = genKeys();
        const bob = await User.create({
            username: 'bob_friend',
            email: 'bob@test.com',
            password: 'password123',
            publicKey: keysB.publicKey,
            privateKey: keysB.privateKey,
            verified: true,
            friends: [] // Will populate
        });

        // make them friends
        alice.friends.push({ user: bob._id, status: 'accepted' });
        await alice.save();
        bob.friends.push({ user: alice._id, status: 'accepted' });
        await bob.save();
        console.log('[Setup] Alice and Bob are now friends.');

        // 2. Alice Creates a Note
        const note = await noteService.createNote({
            title: 'Project Alpha',
            content: 'Initial Layout'
        }, alice);
        console.log(`[Setup] Alice created note (Version: ${note.__v})`);

        // 3. Alice Shares with Bob (Editor)
        await noteService.shareNote(note._id, [bob._id], alice);
        // We need to re-fetch to see if version changed (it might, due to update)
        // But shareNote just updates sharedWith array, let's see if it bumps __v (usually yes for save)
        const sharedNote = await noteService.getNoteById(note._id, alice);
        console.log(`[Setup] Note shared with Bob. Current Version: ${sharedNote.__v}`);

        // 4. Bob Fetches the Note
        // Bob needs to decrypt it using his key (NoteService handles this logic)
        const bobViewOfNote = await noteService.getNoteById(note._id, bob);
        console.log(`[Step 4] Bob sees note title: "${bobViewOfNote.title}" (Version: ${bobViewOfNote.__v})`);

        // 5. Alice Fetches the Note (at same time)
        const aliceViewOfNote = await noteService.getNoteById(note._id, alice);
        console.log(`[Step 5] Alice sees note title: "${aliceViewOfNote.title}" (Version: ${aliceViewOfNote.__v})`);

        // 6. Bob Upates the Note (First to save)
        console.log('\n[Step 6] Bob saves changes ("Project Beta")...');
        const bobUpdate = await noteService.updateNote(
            note._id,
            { title: 'Project Beta' },
            bob,
            bobViewOfNote.__v // Passing correct version
        );
        console.log(`[Step 6] SUCCESS. Bob updated note. New Version: ${bobUpdate.__v}`);


        // 7. Alice Tries to Update (Using OLD Version)
        console.log('\n[Step 7] Alice tries to save changes ("Project Alpha V2") using OLD version...');
        try {
            await noteService.updateNote(
                note._id,
                { title: 'Project Alpha V2' },
                alice,
                aliceViewOfNote.__v // This is now STALE (Old Version)
            );
            console.error('[Step 7] FAIL: Alice should have been blocked!');
        } catch (err) {
            if (err.message.includes('Conflict')) {
                console.log(`[Step 7] SUCCESS: Alice verified CONFLICT error. Message: "${err.message}"`);
                console.log('         (Alice must refresh to see Bob\'s changes)');
            } else {
                console.error(`[Step 7] Unexpected Error: ${err.message}`);
            }
        }

        // 8. Alice Refreshes and Updates
        console.log('\n[Step 8] Alice refreshes (gets updated version)...');
        const aliceFreshView = await noteService.getNoteById(note._id, alice);
        console.log(`[Step 8] Alice sees Bob's title: "${aliceFreshView.title}" (Version: ${aliceFreshView.__v})`);

        console.log('[Step 9] Alice updates with Fresh Version...');
        const aliceFinalUpdate = await noteService.updateNote(
            note._id,
            { title: 'Project Gamma (Merged)' },
            alice,
            aliceFreshView.__v
        );
        console.log(`[Step 9] SUCCESS. Alice updated note. Final Version: ${aliceFinalUpdate.__v}`);


    } catch (err) {
        console.error('Test Failed:', err);
    } finally {
        // Cleanup if possible, or leave for inspection
        if (conn) await mongoose.connection.close();
    }
}

runSharedConcurrencyTest();
