# Agile & Scrum Process Documentation: SecureNote

## 1. Introduction: The Scrum Methodology

The development of **SecureNote** adhered to a rigid **Scrum** framework to manage the complexity of building a Zero-Trust application. We divided the project into **14 Sprints** (May 12, 2025 – November 21, 2025).

### The Product Backlog (Input)
The central artifact of our process was the **Product Backlog**. It served as the single source of truth for all requirements, containing over 120 technical items categorized by infrastructure, security, and feature logic. No code was written unless it was first defined as a backlog item.

> ![Figure 1: Master Product Backlog](PLACEHOLDER_FOR_USER_SCREENSHOT)
> *The comprehensive backlog that drove the entire development lifecycle.*

---

## 2. Iterative Sprint Execution (14 Sprints)

### Sprint 1: Deployment & ZTA Foundation
**Dates**: May 12 – May 23, 2025
**Sprint Goal**: Establish a reproducible Zero-Trust boundary and Dockerized environment.

#### 1. Sprint Planning
*   **Selected Backlog Items**: `ENV-01` (Git logic), `ENV-02` (Docker logic), `ENV-04` (Config), `SEC-01` (Security Headers), `AUT-01` (Password hashing).
*   **Total Story Points**: 13 SP.
*   **Task Breakdown**: The team decomposed these stories into actionable tasks: writing the `Dockerfile`, configuring `docker-compose.yml`, implementing the `bcrypt` utility, and setting up the `helmet` middleware.

#### 2. Development & Testing
*   **Development**: Focused on ensuring environment parity between local (macOS) and production (Linux) containers.
*   **Testing**: Validated that passwords were never stored in plaintext by inspecting the raw MongoDB documents.

#### 3. Sprint Review & Backlog Refinement
*   **Review**: Demonstrated the "one-command startup" to stakeholders.
*   **Refinement**: Feedback indicated that simple JWTs were insufficient. We added `AUT-03` (Double-Token Architecture) to the backlog for Sprint 2.

#### 4. Sprint Retrospective
*   **Process**: Docker builds were initially slow. We optimized this by implementing multi-stage builds (`ENV-03`).

> ![Sprint 1 Burndown Chart](PLACEHOLDER_FOR_USER_SCREENSHOT)

---

### Sprint 2: The Double-Token Session Engine
**Dates**: May 26 – June 6, 2025
**Sprint Goal**: Secure session management resistant to XSS/CSRF.

#### 1. Sprint Planning
*   **Selected Backlog Items**: `AUT-03` (Access/Refresh Tokens), `AUT-04` (HTTPOnly Cookies), `SEC-04` (Rate Limiting).
*   **Total Story Points**: 18 SP.
*   **Task Breakdown**: Designing the rotation logic, configuring the cookie parser, and implementing Redis-backed rate limiting.

#### 2. Development & Testing
*   **Testing**: We simulated XSS attacks to ensure the refresh token could not be accessed by JavaScript. Verified transparent token rotation using standard API clients.

#### 3. Sprint Review & Backlog Refinement
*   **Refinement**: Security audit revealed need for "Global Logout". Added `AUT-06` (Token Versioning) to the backlog.

#### 4. Sprint Retrospective
*   **Process**: The complexity of the rotation logic delayed the sprint. We agreed to pair-program on critical security features in future sprints.

> ![Sprint 2 Burndown Chart](PLACEHOLDER_FOR_USER_SCREENSHOT)

---

### Sprint 3: Asymmetric Identity
**Dates**: June 9 – June 20, 2025
**Sprint Goal**: Client-side cryptography foundation.

#### 1. Sprint Planning
*   **Selected Backlog Items**: `CRY-01` (RSA Key Gen), `UX-01` (Next.js Setup), `UX-02` (Sidebar).
*   **Total Story Points**: 16 SP.
*   **Task Breakdown**: Implementing the `crypto` module logic for key pair generation and building the frontend scaffolding.

#### 2. Development & Testing
*   **Challenges**: Generating 2048-bit keys on the frontend was resource-intensive. We moved this logic to the secure backend registration flow.

#### 3. Sprint Review & Refinement
*   **Review**: Showed the key generation during user signup.
*   **Refinement**: Stakeholders requested a "Dark Mode" for better usability. Added `UX-03` to the backlog.

#### 4. Retrospective
*   **Process**: Frontend/Backend integration was smooth due to shared TypeScript interfaces.

> ![Sprint 3 Burndown Chart](PLACEHOLDER_FOR_USER_SCREENSHOT)

---

### Sprint 4: CRUD & Concurrency Strategy
**Dates**: June 23 – July 4, 2025
**Sprint Goal**: Atomic note management with conflict protection.

#### 1. Sprint Planning
*   **Selected Backlog Items**: `NOT-01` (CRUD), `NOT-03` (Optimistic Locking), `NOT-04` (Conflict Handling).
*   **Total Story Points**: 23 SP.
*   **Task Breakdown**: Implementing `findOneAndUpdate` with version checks.

#### 2. Development & Testing
*   **QA**: Verified that simultaneous edits triggered a `409 Conflict` error, preventing data overwrites.

#### 3. Sprint Review & Refinement
*   **Refinement**: Users wanted a way to recover accidentally deleted notes. Added `NOT-07` (Trash Bin) to the backlog.

#### 4. Retrospective
*   **Process**: Optimistic locking proved effective and easier to implement than WebSockets.

> ![Sprint 4 Burndown Chart](PLACEHOLDER_FOR_USER_SCREENSHOT)

---

### Sprint 5: Hybrid Encryption Core
**Dates**: July 7 – July 18, 2025
**Sprint Goal**: End-to-end payload security.

#### 1. Sprint Planning
*   **Selected Items**: `CRY-02` (AES-GCM), `CRY-03` (Hybrid Wrap), `SEC-03` (Sanitization).
*   **Total Story Points**: 34 SP.
*   **Task Breakdown**: Building the encryption service that wraps the content key with the user's public key.

#### 2. Development & Testing
*   **QA**: Validated that appropriate IVs (Initialization Vectors) were unique for every encryption operation.

#### 3. Sprint Review & Refinement
*   **Review**: Demonstrated that DB admins could check the database but see only ciphertext.
*   **Refinement**: Raised the issue of "Searching" encrypted data. Added `CRY-04` (In-Memory Search) to the backlog.

#### 4. Retrospective
*   **Process**: High complexity sprint. We decided to split future cryptography tasks into smaller chunks.

> ![Sprint 5 Burndown Chart](PLACEHOLDER_FOR_USER_SCREENSHOT)

---

### Sprint 6: The Search-Privacy Paradox
**Dates**: July 21 – August 1, 2025
**Sprint Goal**: Enable search on blind storage via RAM decryption.

#### 1. Sprint Planning
*   **Selected Items**: `CRY-04` (In-Memory Search), `NOT-02` (Filter Scan), `UX-05` (Skeletons).
*   **Total Story Points**: 23 SP.
*   **Task Breakdown**: Designing the "Load-Decrypt-Scan-Discard" pipeline.

#### 2. Development & Testing
*   **QA**: Performance tested with 1,000 notes. Latency was acceptable (<200ms).

#### 3. Sprint Review & Refinement
*   **Review**: Showed the "Search" bar working on encrypted notes.
*   **Refinement**: Added `SOC-01` (Friendship) for the next phase of collaboration.

#### 4. Retrospective
*   **Process**: This solution avoided "Searchable Encryption" leaks, validating our "Security First" approach.

> ![Sprint 6 Burndown Chart](PLACEHOLDER_FOR_USER_SCREENSHOT)

---

### Sprint 7: Friendship Networking
**Dates**: August 4 – August 15, 2025
**Sprint Goal**: Permission-based user relations.

#### 1. Sprint Planning
*   **Selected Items**: `SOC-01` (Friend Requests), `SOC-03` (User Search), `SOC-04` (Management), `SEC-09` (Rate Limits).
*   **Total Story Points**: 18 SP.
*   **Task Breakdown**: Implementing the state machine (Pending -> Accepted) for friends.

#### 2. Development & Testing
*   **QA**: Tested edge cases like "Rejecting" a request or "Blocking" a user.

#### 3. Sprint Review & Refinement
*   **Refinement**: Realized users could enumerate valid emails via search. Added rate-limiting to the search endpoint (`SEC-09`).

#### 4. Retrospective
*   **Process**: UI development for the "Friend Manager" was faster than expected using ShadCN components.

> ![Sprint 7 Burndown Chart](PLACEHOLDER_FOR_USER_SCREENSHOT)

---

### Sprint 8: Secure Collaboration
**Dates**: August 18 – August 29, 2025
**Sprint Goal**: Dynamic ACL key re-wrapping.

#### 1. Sprint Planning
*   **Selected Items**: `CRY-05` (Key Re-wrap), `SOC-02` (ACL Checks), `SOC-05` (Unsharing), `NOT-09` (Markdown).
*   **Total Story Points**: 21 SP.
*   **Task Breakdown**: Logic to decrypt the Note Key with Owner's Private Key, then re-encrypt it with Friend's Public Key.

#### 2. Development & Testing
*   **QA**: Verified that a "Viewer" could not edit, and an "Editor" could not delete the note owner's copy.

#### 3. Sprint Review & Refinement
*   **Refinement**: Needed more granular control. Added `SEC-06` (Resource Guards) for the next sprint.

#### 4. Retrospective
*   **Process**: This was the most mathematically complex sprint. The team used "Mob Programming" to ensure correctness.

> ![Sprint 8 Burndown Chart](PLACEHOLDER_FOR_USER_SCREENSHOT)

---

### Sprint 9: Defense-in-Depth GA
**Dates**: September 1 – September 12, 2025
**Sprint Goal**: Global hardening and sanitization.

#### 1. Sprint Planning
*   **Selected Items**: `SEC-02` (CSP), `SEC-05` (RBAC), `SEC-06` (Guards), `ADM-04` (Security Logger).
*   **Total Story Points**: 21 SP.
*   **Task Breakdown**: Configuring Content Security Policy and centralized logging.

#### 2. Development & Testing
*   **QA**: Ran automated vulnerability scanners (OWASP ZAP) against the endpoints.

#### 3. Sprint Review & Refinement
*   **Refinement**: Logs showed spam accounts being created. Added `VER-01` (Unverified Restrictions) to Sprint 10.

#### 4. Retrospective
*   **Process**: Automated security scanning was integrated into the CI pipeline.

> ![Sprint 9 Burndown Chart](PLACEHOLDER_FOR_USER_SCREENSHOT)

---

### Sprint 10: Restriction & Compliance (GDPR)
**Dates**: September 15 – September 26, 2025
**Sprint Goal**: User limits and right-to-erasure.

#### 1. Sprint Planning
*   **Selected Items**: `VER-01` (1-Note Limit), `VER-02` (Plaintext Only), `GDPR-01` (Full Deletion), `GDPR-02` (Purge).
*   **Total Story Points**: 19 SP.
*   **Task Breakdown**: Middleware to check `verified` status before note creation.

#### 2. Development & Testing
*   **QA**: Verified that `deleteFullAccount` removed files from disk and anonymized logs.

#### 3. Sprint Review & Refinement
*   **Refinement**: Admins needed a dashboard to verify users. Added `VER-05` to Sprint 11.

#### 4. Retrospective
*   **Process**: GDPR compliance is complex; we created a dedicated comprehensive test suite for deletion logic.

> ![Sprint 10 Burndown Chart](PLACEHOLDER_FOR_USER_SCREENSHOT)

---

### Sprint 11: Admin Control Plane
**Dates**: September 29 – October 10, 2025
**Sprint Goal**: Real-time monitoring and verification.

#### 1. Sprint Planning
*   **Selected Items**: `ADM-03` (Health Stats), `ADM-05` (Log Paging), `VER-05` (Verification UI), `VER-06` (Email Notify).
*   **Total Story Points**: 23 SP.
*   **Task Breakdown**: Building the Admin Dashboard with Charts.js.

#### 2. Development & Testing
*   **QA**: Validated that non-admins could not access these routes (403 Forbidden).

#### 3. Sprint Review & Refinement
*   **Refinement**: Added `ADM-01` (SuperAdmin role) to prevent admins from deleting each other.

#### 4. Retrospective
*   **Process**: Frontend visual components (charts) improved the demo experience significantly.

> ![Sprint 11 Burndown Chart](PLACEHOLDER_FOR_USER_SCREENSHOT)

---

### Sprint 12: Account Hardening (MFA/RBAC)
**Dates**: October 13 – October 24, 2025
**Sprint Goal**: Multi-factor identity.

#### 1. Sprint Planning
*   **Selected Items**: `AUT-09` (TOTP), `AUT-10` (QR Code), `AUT-11` (Verify), `ADM-01` (SuperAdmin).
*   **Total Story Points**: 18 SP.
*   **Task Breakdown**: Integrating `otplib` for 2FA.

#### 2. Development & Testing
*   **QA**: Tested the QR code flow with Google Authenticator.

#### 3. Sprint Review & Refinement
*   **Refinement**: The system was now feature complete. Focus shifted to "Polish" and "Uploads".

#### 4. Retrospective
*   **Process**: MFA implementation was straightforward due to clear libraries.

> ![Sprint 12 Burndown Chart](PLACEHOLDER_FOR_USER_SCREENSHOT)

---

### Sprint 13: Feature Polish & Uploads
**Dates**: October 27 – November 7, 2025
**Sprint Goal**: Multimedia support.

#### 1. Sprint Planning
*   **Selected Items**: `UPL-01` (Multer), `UPL-02` (Isolation), `UPL-03` (Filter), `UX-03`, `UX-06`.
*   **Total Story Points**: 15 SP.
*   **Task Breakdown**: Secure file upload logic.

#### 2. Development & Testing
*   **QA**: Attempted to upload `.exe` files and verified they were rejected.

#### 3. Sprint Review & Refinement
*   **Refinement**: Final preparation for the production release and audit.

#### 4. Retrospective
*   **Process**: Code freeze implemented for the next sprint.

> ![Sprint 13 Burndown Chart](PLACEHOLDER_FOR_USER_SCREENSHOT)

---

### Sprint 14: Final QA & Certification
**Dates**: November 10 – November 21, 2025
**Sprint Goal**: Production certification.

#### 1. Sprint Planning
*   **Selected Items**: `QA-04` (Cypress), `QA-05` (OWASP Audit), `DOC-03` (Logic Manual).
*   **Total Story Points**: 31 SP.
*   **Task Breakdown**: Running full regression suites.

#### 2. Development & Testing
*   **QA**: 100% pass rate on E2E tests.

#### 3. Sprint Review
*   **Outcome**: The product was deemed "Stable" and "Secure" for release.

#### 4. Retrospective
*   **Process**: The Agile process allowed us to address 100+ technical items without missing a single security requirement.

> ![Sprint 14 Burndown Chart](PLACEHOLDER_FOR_USER_SCREENSHOT)

---

## 3. Conclusion

This documentation confirms that every feature in **SecureNote** was the result of a deliberate, iterative process starting from the **Product Backlog**, moving through **Sprint Planning**, **Execution**, and **Review**.
