# Complex and Custom Business Logic

This document explains the intricate business logic and technical decisions behind SecureNote's most sophisticated features. These implementations go beyond standard CRUD operations and demonstrate advanced software engineering concepts.

---

## 1. Concurrent Note Editing Strategy (Live Modification)

### The Problem
Imagine two users, Alice and Bob, both editing the same shared note simultaneously. Alice changes the title while Bob updates the content. When they both hit "Save," whose changes should win? If we're not careful, one person's work could be completely lost, or worse, we could end up with corrupted data that's a messy mix of both edits.

This is the classic **concurrent modification problem**, and it's particularly tricky in web applications where multiple users can access the same resource at the same time.

### Our Solution: Optimistic Locking

We implemented **Optimistic Locking**, a strategy that assumes conflicts are rare (which they usually are) but handles them gracefully when they do occur. Here's how it works in plain English:

Every note in our database has a hidden version number (stored in the `__v` field by Mongoose). Think of it like a revision counter that increments every time someone saves changes.

**The Flow:**
1. **Read Phase**: When Alice opens Note #42, she gets the note content along with its current version number, let's say version 5.
2. **Edit Phase**: Alice makes her changes locally in her browser. Meanwhile, Bob also opens the same note and gets version 5.
3. **Save Phase - Alice First**: Alice finishes first and clicks Save. Her request says: "Update Note #42, but only if it's still at version 5." The server checks, sees it's indeed version 5, applies her changes, and bumps the version to 6.
4. **Save Phase - Bob's Conflict**: A few seconds later, Bob clicks Save. His request also says: "Update Note #42 if it's at version 5." But the server checks and finds the note is now at version 6 (because Alice already saved). The server immediately rejects Bob's request with a `409 Conflict` error.
5. **Resolution**: Bob's browser shows a friendly message: "This note was modified by another user. Please refresh to see the latest version." Bob refreshes, sees Alice's changes, and can then re-apply his edits on top of the current version.

### Why This Approach?

We considered several alternatives:

**Pessimistic Locking** (like file locking in Google Docs): When Alice opens the note, it locks for everyone else. This prevents conflicts entirely but creates a poor user experience. What if Alice leaves her browser open and goes to lunch? Bob would be blocked for hours.

**Real-time Collaborative Editing** (like Google Docs' character-by-character sync): This is the gold standard for collaboration but requires WebSockets, operational transformation algorithms (CRDTs), and significantly more complex infrastructure. For a note-taking app where simultaneous editing is rare, this would be over-engineering.

**Last Write Wins** (no conflict detection): Simple but dangerous. Bob's changes would silently overwrite Alice's work, and she'd never know. Unacceptable for a secure application.

**Optimistic Locking** strikes the perfect balance:
- ✅ Stateless (fits REST API architecture perfectly)
- ✅ No performance overhead during normal operation
- ✅ Conflicts are detected and handled gracefully
- ✅ Simple to implement and test
- ✅ Industry-standard approach (used by Git, databases, etc.)

### Technical Implementation Details

**Backend Code** (`backend/controllers/noteController.js`):
```javascript
const updatedNote = await Note.findOneAndUpdate(
    { _id: noteId, __v: version },  // Only update if version matches
    {
        $set: { title, content, format },
        $inc: { __v: 1 }  // Increment version atomically
    },
    { new: true }
);

if (!updatedNote) {
    // Check if note exists (to distinguish "not found" from "version conflict")
    const exists = await Note.findOne({ _id: noteId, owner: req.user.id });
    if (exists) {
        return res.status(409).json({ 
            error: 'Conflict: Note has been modified by another user. Please refresh and try again.' 
        });
    }
    return res.status(404).json({ error: 'Note not found' });
}
```

The key is the **atomic** `findOneAndUpdate` operation. MongoDB guarantees that the version check and increment happen as a single transaction, preventing race conditions even under high load.

### Sequence Diagram

**Diagram File**: [`diagrams/concurrent_note_editing.puml`](diagrams/concurrent_note_editing.puml)

This diagram shows the complete flow of two users attempting to save changes to the same note, with User A succeeding and User B encountering a version conflict.

---

## 2. Secure Note Sharing Authorization Flow

### The Problem
Sharing encrypted notes is deceptively complex. It's not just about giving someone access—we need to ensure that:
1. Only authorized friends can receive shares (no spam or unauthorized access)
2. The shared content remains encrypted end-to-end
3. Different permission levels (viewer vs. editor) are enforced
4. The owner can revoke access at any time

### The Challenge: Encryption Key Management

Here's the tricky part: if notes are encrypted with the owner's key, how can a friend decrypt them? We can't just give the friend the owner's private key (that would compromise all the owner's notes). We need a way to selectively grant access to specific notes.

### Our Solution: Public Key Encryption for Sharing

We use a hybrid encryption approach inspired by PGP and modern secure messaging systems:

**The Flow:**

1. **Friendship Verification**: Before anything else, the system checks if the target user is actually in the owner's friends list. This prevents random people from receiving shares and protects against spam.

2. **Key Retrieval**: The system fetches the friend's public RSA key from their user profile. Every user has a public/private key pair generated during registration.

3. **Content Encryption**: Here's the clever part:
   - The note's content is encrypted with a symmetric key (AES-256, fast for large data)
   - This symmetric key is then encrypted using the **friend's public RSA key**
   - Only the friend's private key (which never leaves their device) can decrypt this

4. **Permission Storage**: The system stores this encrypted key in the note's `sharedWith` array:
   ```javascript
   sharedWith: [
       {
           user: friendId,
           permission: "viewer",  // or "editor"
           encryptedKey: "RSA_ENCRYPTED_SYMMETRIC_KEY"
       }
   ]
   ```

5. **Access Control**: When the friend tries to access the note, the backend:
   - Checks if they're in the `sharedWith` array
   - Returns the encrypted key specific to them
   - The friend's browser uses their private key to decrypt the symmetric key
   - The symmetric key decrypts the actual note content

### Permission Levels Explained

**Viewer**: Can read the note but cannot modify it. The backend checks the permission level before allowing PUT requests.

**Editor**: Can both read and modify the note. However, they cannot share it further (only the owner can share).

### Why This Architecture?

**Security**: Even if the database is compromised, the attacker can't read shared notes without the users' private keys.

**Granularity**: Each friend gets their own encrypted copy of the access key, allowing for individual revocation.

**Performance**: Symmetric encryption (AES) is fast for the actual content, while asymmetric encryption (RSA) is only used for the small key.

**Scalability**: No need for a central key server or complex key distribution protocol.

### Technical Implementation Details

**Backend Code** (`backend/controllers/noteController.js`):
```javascript
// Verify friendship
const isFriend = req.user.friends.some(f => f.user.toString() === targetUser._id.toString());
if (!isFriend) {
    return res.status(403).json({ error: 'You can only share notes with friends' });
}

// Encrypt and share
note.sharedWith.push({
    user: targetUser._id,
    permission: permission,  // 'viewer' or 'editor'
    encryptedKey: encryptedKeyForTarget  // AES key encrypted with target's public key
});

await note.save();
```

### Sequence Diagram

**Diagram File**: [`diagrams/secure_note_sharing.puml`](diagrams/secure_note_sharing.puml)

This diagram illustrates the complete sharing flow, from friendship verification through encryption to the friend accessing the shared note.

---

## 3. Admin Verification Decision Process

### The Problem
How do we prevent malicious users from creating accounts and immediately spamming or abusing the system, while still allowing legitimate users to access features quickly?

### Our Solution: Admin-Gated Verification

New users can register and use basic features (creating personal notes), but sensitive features like **sharing notes** are locked until an admin manually verifies their account. This creates a human checkpoint in the security pipeline.

### The Lifecycle

**Phase 1: Registration**
- User signs up with email/password or OAuth
- System creates account with `verified: false`
- User can log in and create personal notes
- Sharing features are disabled (returns 403 Forbidden)

**Phase 2: Verification Request**
- User clicks "Request Verification" in their account settings
- System logs this request with timestamp and user details
- Admin receives notification (visible in Admin Panel)

**Phase 3: Admin Review**
- Admin logs into the Admin Panel
- Views list of pending verification requests
- Reviews user's profile, registration date, and activity logs
- Makes decision: Approve or Reject

**Phase 4: Approval**
- Admin clicks "Approve"
- System updates: `verified: true`
- Security log records: `user_verified` event
- User receives email confirmation
- All features are now unlocked

**Phase 5: Rejection (Optional)**
- Admin clicks "Reject" if suspicious activity detected
- User is notified and can appeal or re-register
- Security log records: `user_rejected` event

### Why Manual Verification?

**Spam Prevention**: Automated bots can't bypass human review.

**Quality Control**: Ensures the user base consists of real, legitimate users.

**Security Audit Trail**: Every verification decision is logged for compliance.

**Flexibility**: Admins can apply judgment (e.g., recognizing corporate email domains as trustworthy).

### Technical Implementation Details

**Middleware Check** (`backend/middleware/verification.js`):
```javascript
const requireVerified = (req, res, next) => {
    if (!req.user.verified) {
        return res.status(403).json({ 
            error: 'Your account is not verified. Please contact an admin to unlock full functionality.' 
        });
    }
    next();
};
```

**Applied to Sharing Routes**:
```javascript
router.post('/notes/:id/share', authenticate, requireVerified, shareNote);
```

### Activity Diagram

**Diagram File**: [`diagrams/admin_verification_process.puml`](diagrams/admin_verification_process.puml)

This diagram shows the complete user verification lifecycle, from registration through admin review to feature unlocking.

---

## Summary

These three complex logic flows demonstrate SecureNote's commitment to:
- **Data Integrity**: Optimistic locking prevents data corruption
- **Security**: Multi-layer encryption and access control
- **User Experience**: Graceful conflict handling and clear permission models
- **Scalability**: Stateless architecture that can handle growth

Each solution was chosen after careful consideration of alternatives, balancing security, performance, and user experience.
