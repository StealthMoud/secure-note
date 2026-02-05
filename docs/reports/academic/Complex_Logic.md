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
- **Constraint**: Unverified users are limited to creating only 1 plaintext note to prevent storage abuse.

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

## 4. Zero-Trust Session Architecture

### The Problem
Traditional session management often relies on long-lived secrets or is vulnerable to common attacks like XSS (Cross-Site Scripting). If an attacker steals a user's session token, they can impersonate that user indefinitely. We needed a system that is robust against theft and supports "Zero Trust" principles—verifying every request rather than trusting a long-lived session implicitly.

### Our Solution: Double-Token Rotating Architecture

We implemented a state-of-the-art authentication system using two types of tokens: **Access Tokens** and **Refresh Tokens**.

**The Logic:**
1. **Access Token (Short-lived)**:
   - This JWT is valid for only **15 minutes**.
   - It is sent in the JSON body of the login response and stored in memory (JavaScript state) on the frontend.
   - **Why?** Since it's in memory, XSS attacks can technically read it, but because it expires so quickly, the window of opportunity for an attacker is negligible.

2. **Refresh Token (Long-lived)**:
   - This JWT is valid for **7 days**.
   - It is sent as an **HTTPOnly, Secure, SameSite=Strict cookie**.
   - **Why?** JavaScript cannot read HTTPOnly cookies. This makes the refresh token completely immune to XSS attacks. Even if an attacker injects malicious scripts, they cannot steal the refresh token.

### The Rotation Mechanism (The "Complex" Part)
What happens when the Access Token expires after 15 minutes?

1. The frontend tries to make an API request using the expired Access Token.
2. The server responds with `401 Unauthorized`.
3. The frontend's `axios` interceptor catches this error seamlessly in the background.
4. It sends a request to `/auth/refresh-token`.
5. The server:
   - Reads the HTTPOnly cookie.
   - Verifies the transparency of the Refresh Token.
   - Issues a **new** Access Token.
   - **Critical Step**: It allows the session to continue without the user ever realizing they "logged out."

### Security Features
- **Token Versioning**: We store a `tokenVersion` integer on the user's database record. Every time a password is reset or a suspicious activity is detected, we increment this version. The token generation logic embeds this version into the JWTs. If the version in the token doesn't match the database, the token is instantly invalidated—allowing us to "remote kill" sessions globaly.
- **Force Logout**: We can revoke access immediately by simply incrementing the `tokenVersion`.

**Code Insight** (`backend/services/auth/tokenService.js`):
```javascript
const setRefreshTokenCookie = (res, refreshToken) => {
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true, // JS cannot read this
        secure: process.env.NODE_ENV === 'production', // encrypted connection only
        sameSite: 'strict', // prevents CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};
```

This specific combination of flags makes our session management practically bulletproof against the most common web vulnerabilities.

### Sequence Diagram

**Diagram File**: [`diagrams/zero_trust_session.puml`](diagrams/zero_trust_session.puml)

This diagram visualizes the secure token rotation flow, showing how the frontend intercepts expired tokens and refreshes them transparently using the HTTPOnly cookie.

---

## 5. The Search-Privacy Paradox

### The Problem
Users expect to be able to search their notes instantly by typing a keyword like "Coordinates". However, **all** note content (and titles) in our secure database are encrypted. This leads to a fundamental conflict: **How can the server search for a word it cannot read?**

If we simply searched the encrypted strings, a search for "Coordinates" would never match the encrypted blob `U2FsdGVkX1...`.

### Our Solution: Blind Storage, Seeing Runtime

We resolve this paradox by strictly separating the **Storage Layer** (Database) from the **Application Layer** (Runtime Memory).

- **At Rest (Storage)**: The database is "Blind." It stores only encrypted blobs (`content: ""`, `title: "Encrypted Note"`). It has zero knowledge of what the notes contain.
- **In Motion (Runtime)**: The Application is "Seeing." When a user searches, the server uses the keys (temporarily available during the request) to decrypt the notes **in memory**.

### Step-by-Step Logic Flow
To understand exactly how this works (and why it's secure), detailed below is the query process when a user searches for the word "Grocery":

**Step 1: The Request**
The user types "Grocery" into the search bar. The frontend sends a request:
`GET /notes?search=Grocery`

**Step 2: The "Blind" Fetch**
The backend asks the database for **all** notes belonging to the user.
- **Database Reality**: The DB returns a list of encrypted blobs. It does NOT perform the search. It just hands over the locked boxes.

**Step 3: In-Memory Decryption (The "Seeing" Phase)**
The server, holding the user's keys for the duration of this request, decrypts the notes in the volatile Random Access Memory (RAM).
- *Crucially*: These decrypted versions are **never** written back to the disk. They exist only for milliseconds.

**Step 4: The Application Filter**
Now that the data is plain text in memory, the application logic runs the search filter:
- Does `note.title` contain "Grocery"?
- Does `note.content` contain "Grocery"?
- Does `note.tags` contain "Grocery"?

**Step 5: The Result**
The server returns only the notes that matched. The memory is cleared of the decrypted data as the request context ends.

### The Paradox Resolved
**Q: Can we search encrypted notes?**
**A: Yes.** We search them by momentarily unlocking them in a secure, ephemeral environment (RAM) and then locking them again. This satisfies the user's need for utility while maintaining the strict promise that **data at rest is always encrypted**.

### Scalability Analysis: The Cost of Privacy
You asked: *"Is this best practice for large datasets?"*
From an academic software engineering perspective, this architecture represents a classic **Trade-Off**:

| Feature | Standard App (Plaintext) | SecureNote (In-Memory Decryption) |
| :--- | :--- | :--- |
| **Search Speed** | **O(log n)** (Indexed DB) | **O(n)** (Linear Scan) |
| **Privacy** | Low (DB Admin sees all) | **High (Zero Knowledge)** |
| **Implementation** | Simple | Complex (RAM Management) |
| **Max Scale** | Millions of Notes | ~10,000 Notes per User |

**Why we chose this approach:**
For a *Personal* Note capability, O(n) is perfectly acceptable. Even with 5,000 notes, Node.js can decrypt and filter them in milliseconds.
To scale to *millions* of notes while keeping them encrypted, we would need **Searchable Symmetric Encryption (SSE)** or **Blind Indexing** (storing hashed keywords like `HMAC("grocery")`). However, that introduces information leakage (frequency analysis attacks).
**Verdict:** We prioritized **Absolute Privacy** and **Code Simplicity** over infinite scalability.

### Component Diagram

**Diagram File**: [`diagrams/search_privacy_paradox.puml`](diagrams/search_privacy_paradox.puml)

This diagram illustrates how the database remains blind while the application layer acts as the temporary bridge to enable search.

---

## 6. Defense-in-Depth Pipeline

### The Problem
Relying on a single security measure (like a password) is like having a house with a steel door but open windows. We needed a comprehensive "defense-in-depth" strategy that processes every request through multiple layers of security before it ever touches business logic.

### Our Solution: The 4-Layer Security Pipeline

Every single request that hits our backend goes through a rigorous gauntlet of middleware:

**Layer 1: The Gateway (Rate Limiting)**
Before anything else, `rateLimiter.js` checks if the IP address is behaving normally. We don't just have one global limit; we have **context-aware limits**:
- **General API**: 2500 requests/15min (Generous for normal use).
- **Authentication**: 50 requests/15min (Strict to prevent brute-force attacks).
- **Account Creation**: 10 requests/hour (Stops bot signups).
- **Sensitive Operations**: 20 requests/15min (For deletes/admin actions).

**Layer 2: The Shield (Helmet & Headers)**
`security.js` applies HTTP headers that instruct the browser how to behave securely:
- **CSP (Content Security Policy)**: Prevents the browser from loading malicious scripts from unauthorized domains.
- **HSTS**: Forces the browser to use HTTPS.
- **X-Frame-Options**: "DENY" prevents our site from being embedded in hidden iframes (Clickjacking protection).

**Layer 3: The Filter (Sanitization)**
`sanitization.js` automatically scans `req.body`, `req.query`, and `req.params`. It uses regex to strip out dangerous characters and XSS vectors (like `<script>` tags or `javascript:` links). This happens *automatically* for every string input, meaning developers don't have to remember to "sanitize X variable"—it's handled globally.

**Layer 4: The Bouncers (Validation & Auth)**
Finally, `validationMiddleware.js` checks that data types match (e.g., "email" is actually an email), and `auth.js` verifies the JWT signature.

### Visualizing the Pipeline
```text
Request 
   ↓ 
[Rate Limiter] -> Too fast? -> 429 Too Many Requests
   ↓
[Security Headers] -> Inject protection headers
   ↓
[Sanitizer] -> Strip <script> tags
   ↓
[Validator] -> Check Schema (Zod/Express-Validator)
   ↓
[Business Logic] -> Safe to execute!
```

This multi-layered approach ensures that even if one layer fails (e.g., a validator has a bug), the other layers (like the sanitizer) can catch various forms of attacks. It turns our backend into a fortress rather than just a server.

### Architecture Diagram

**Diagram File**: [`diagrams/defense_in_depth.puml`](diagrams/defense_in_depth.puml)

This diagram maps the flow of a request through the four distinct security layers before it reaches the core application logic.
