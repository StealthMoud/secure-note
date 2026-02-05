# Agile Artifacts Data Source (100% COMPLETE)

> [!IMPORTANT]
> **Use this file for ALL your screenshots.**
> *   **Section 1**: Master Product Backlog (Use for "Figure 1")
> *   **Section 2**: Sprint Data (Use for "Burndown Charts" and "Sprint Plans")

---

## 1. Master Product Backlog (Full Source of Truth)

| ID | Category | Technical Item / User Story | SP | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ENV-01** | Env | Initialize Node/Express repository with specialized Folder Structure | 2 | High | Done |
| **ENV-02** | Env | Local Dev setup with Docker Compose (Hot Refresh) | 5 | High | Done |
| **ENV-03** | Env | Production Multi-Stage Build (Alpine-based) | 3 | Medium | Done |
| **ENV-04** | Env | Centralized Config Loader via `dotenv` and `process.env` validation | 1 | Medium | Done |
| **ENV-05** | Env | Git Branch Protection Rules & Merge Request Template | 2 | Low | Done |
| **AUT-01** | Auth | Bcrypt Salting Algorithm for Password Persistence | 3 | High | Done |
| **AUT-02** | Auth | JWT Secret Validation at Server Startup (failsafe logic) | 1 | High | Done |
| **AUT-03** | Auth | Double-Token Architecture Design (Access + Refresh) | 8 | Critical | Done |
| **AUT-04** | Auth | HTTPOnly Cookie Security Policy (Secure, SameSite=Strict) | 5 | Critical | Done |
| **AUT-05** | Auth | Refresh Token Rotation Middleware (Transparent Session Continuation) | 8 | High | Done |
| **AUT-06** | Auth | Token Versioning in MongoDB for Global Session Revocation | 5 | High | Done |
| **AUT-07** | Auth | OAuth 2.0 Integration: Google Login Strategy | 8 | Medium | Done |
| **AUT-08** | Auth | OAuth 2.0 Integration: GitHub Login Strategy | 8 | Medium | Done |
| **AUT-09** | Auth | MFA: TOTP Secret Generation and Encrypted Storage | 5 | High | Done |
| **AUT-10** | Auth | MFA: QR Code Payload Generation for Authenticator Apps | 3 | Medium | Done |
| **AUT-11** | Auth | MFA: TOTP Challenge/Response Verification | 5 | High | Done |
| **AUT-12** | Auth | Secure Password Update logic with Version Increment | 3 | High | Done |
| **AUT-13** | Auth | Crypto-safe Password Reset Token (1-hour expiration) | 5 | High | Done |
| **AUT-14** | Auth | Email Change verification workflow (Dual confirmation) | 5 | Medium | Done |
| **SEC-01** | Security | Helmet.js integration for X-XSS-Protection & HSTS | 2 | High | Done |
| **SEC-02** | Security | CSP (Content Security Policy) dynamic header generation | 3 | High | Done |
| **SEC-03** | Security | Request Sanitization: Recursive object cleaning (XSS protection) | 8 | Critical | Done |
| **SEC-04** | Security | Context-Aware Rate Limiting (different limits for Auth vs API) | 5 | High | Done |
| **SEC-05** | Security | Role-Based Access Control (RBAC): Hierarchical Middleware | 5 | Critical | Done |
| **SEC-06** | Security | Resource-Level Authorization (authorizeResourceOwner logic) | 5 | High | Done |
| **SEC-07** | Security | Zod/Express-Validator Schema Enforcement | 3 | High | Done |
| **SEC-08** | Security | CORS Restriction (Restricted to verified frontend origin) | 2 | High | Done |
| **SEC-09** | Security | Server-side IP Location Metadata Extraction | 2 | Low | Done |
| **CRY-01** | Crypto | RSA-2048 Asymmetric Key Pair Generation logic | 8 | Critical | Done |
| **CRY-02** | Crypto | AES-256-GCM (Authenticated Encryption) implementation | 13 | Critical | Done |
| **CRY-03** | Crypto | Hybrid Encryption Service Layer (AES key wrapped in RSA) | 13 | Critical | Done |
| **CRY-04** | Crypto | In-Memory Ephemeral Decryption (RAM-only scan for Search) | 13 | High | Done |
| **CRY-05** | Crypto | Note Sharing: RSA Key Re-wrapping logic for Friends | 8 | High | Done |
| **CRY-06** | Crypto | Secure Key Model (Private Key excluded from standard fetches) | 5 | Medium | Done |
| **NOT-01** | Notes | CRUD API: POST /notes with automatic re-encryption | 5 | High | Done |
| **NOT-02** | Notes | CRUD API: GET /notes (Filtering + Decryption scan) | 8 | High | Done |
| **NOT-03** | Notes | Optimistic Locking logic (__v atomic check) | 13 | High | Done |
| **NOT-04** | Notes | 409 Conflict Resolution Handler (Frontend logic) | 5 | Medium | Done |
| **NOT-05** | Notes | Note Pinning/Unpinning behavior | 2 | Low | Done |
| **NOT-06** | Notes | Tagging System (Searchable via in-memory filter) | 3 | Low | Done |
| **NOT-07** | Notes | Soft Delete System (Trash Bin with `deletedAt` timer) | 5 | Medium | Done |
| **NOT-08** | Notes | Trash Recovery / Permanent Purge logic | 3 | Medium | Done |
| **NOT-09** | Notes | Multi-format Note Support (Plaintext vs Markdown) | 5 | Medium | Done |
| **NOT-10** | Notes | Markdown Live-Preview Engine (Unified/Remark) | 8 | Medium | Done |
| **VER-01** | Verification | Unverified Account Restriction: 1-note creation cap | 5 | High | Done |
| **VER-02** | Verification | Unverified Account Restriction: Plaintext format only | 3 | High | Done |
| **VER-03** | Verification | Unverified Account Restriction: Global Sharing Block | 3 | High | Done |
| **VER-04** | Verification | Verification Request Trigger (User Settings -> Admin) | 2 | Medium | Done |
| **VER-05** | Verification | Admin Verification Review Dashboard (UI) | 5 | High | Done |
| **VER-06** | Verification | SMTP/Email Notification for Verification status | 5 | Medium | Done |
| **SOC-01** | Social | Friendship System: Request State Machine (Pending/Accepted) | 8 | High | Done |
| **SOC-02** | Social | Friendship ACL check for Note Sharing | 5 | High | Done |
| **SOC-03** | Social | User Search API (Rate-limited to prevent enumeration) | 3 | Medium | Done |
| **SOC-04** | Social | Manage Friends Dashboard (Requests vs Connections) | 5 | Medium | Done |
| **SOC-05** | Social | Friendship Revocation (Unsharing cleanup) | 3 | Medium | Done |
| **ADM-01** | Admin | SuperAdmin Privilege Level (Role ID 3) | 5 | High | Done |
| **ADM-02** | Admin | Admin Account Management (Promote/Demote logic) | 8 | High | Done |
| **ADM-03** | Admin | Real-time System Health Stats (CPU Load/Memory Usage) | 8 | Medium | Done |
| **ADM-04** | Admin | Security Incident Logging (Centralized Audit Trail) | 8 | Critical | Done |
| **ADM-05** | Admin | Audit Log Pagination and Severity Filtering (Frontend) | 5 | Medium | Done |
| **ADM-06** | Admin | System Broadcast System (Real-time banner logic) | 5 | Low | Done |
| **ADM-07** | Admin | Bulk User Operations (Delete All/Verify All) | 5 | Medium | Done |
| **UPL-01** | Uploads | Multer Secure Configuration (Disk Storage strategy) | 5 | Medium | Done |
| **UPL-02** | Uploads | Per-user upload directory isolation | 3 | Medium | Done |
| **UPL-03** | Uploads | Mime-type filtering (Images only, max 5MB) | 2 | Low | Done |
| **UPL-04** | Uploads | Static File Serving with Authentication Guards | 5 | High | Done |
| **UX-01** | UI | Next.js 14 App Router Architecture | 5 | High | Done |
| **UX-02** | UI | Custom Navigation Sidebar (Context-aware roles) | 3 | Medium | Done |
| **UX-03** | UI | Dark/Light/System Mode using `next-themes` | 2 | Low | Done |
| **UX-04** | UI | Dashboard Statistics Widgets (User perspective) | 3 | Low | Done |
| **UX-05** | UI | Skeleton Loading States (Suspense patterns) | 2 | Low | Done |
| **UX-06** | UI | Mobile Responsive Layout (Tailwind breakpoints) | 3 | Medium | Done |
| **GDPR-01** | GDPR | "Right to be Forgotten": deleteFullAccount logic | 8 | High | Done |
| **GDPR-02** | GDPR | Note Purging on User Deletion (Automated cleanup) | 3 | High | Done |
| **GDPR-03** | GDPR | Security Log Anonymization (Removing user links on exit) | 5 | Medium | Done |
| **GDPR-04** | GDPR | Uploaded File Deletion (fs.rmSync on account close) | 3 | Medium | Done |
| **QA-01** | QA | Unit Test: Encryption/Decryption utility | 13 | High | Done |
| **QA-02** | QA | Unit Test: JWT Token Rotation lifecycle | 8 | High | Done |
| **QA-03** | QA | Integration Test: Shared Note ACL checks | 8 | Medium | Done |
| **QA-04** | QA | Cypress E2E: User Registration + Note Creation | 13 | Medium | Done |
| **QA-05** | QA | OWASP Security Audit (Top 10 scan) | 13 | Critical | Done |
| **DOC-01** | Docs | UML: Zero-Trust Session Sequence Diagram | 2 | Low | Done |
| **DOC-02** | Docs | UML: Hybrid Encryption Flow Diagram | 3 | Medium | Done |
| **DOC-03** | Docs | Complex Logic Manual (Deep Explanation file) | 5 | High | Done |
| **FE-01** | Frontend | Login Form Component (Zod Validation) | 3 | High | Done |
| **FE-02** | Frontend | Registration Form Component (Password Strength Meter) | 3 | High | Done |
| **FE-03** | Frontend | Note Card Component (Grid/List View) | 3 | Medium | Done |
| **FE-04** | Frontend | Rich Text Editor Wrapper (SimpleMDE/Quill) | 5 | Medium | Done |
| **FE-05** | Frontend | Modal/Dialog Provider (Global State) | 3 | Low | Done |
| **FE-06** | Frontend | Toast Notification System (Error/Success Feed) | 2 | Low | Done |
| **FE-07** | Frontend | Theme Toggle Button (Sun/Moon Animation) | 2 | Low | Done |
| **FE-08** | Frontend | User Avatar Generator (Initials/Color) | 2 | Low | Done |
| **FE-09** | Frontend | Protected Route HOC (Redirect Logic) | 5 | High | Done |
| **FE-10** | Frontend | 404 Error Page (Custom Design) | 2 | Low | Done |
| **API-01** | API | Health Check Endpoint (/health) | 1 | Low | Done |
| **API-02** | API | Swagger/OpenAPI Documentation Route | 5 | Low | Done |
| **API-03** | API | Global Error Handling Middleware (Stack trace masking) | 3 | Critical | Done |
| **API-04** | API | Async Handler Wrapper (try/catch elimination) | 3 | Medium | Done |
| **DB-01** | DB | User Mongoose Schema Definition (Validators) | 3 | Critical | Done |
| **DB-02** | DB | Note Mongoose Schema Definition (Indexes) | 3 | Critical | Done |
| **DB-03** | DB | SecurityLog Mongoose Schema Definition (TTL) | 3 | High | Done |
| **DB-04** | DB | Database Indexing Strategy (Email/Username unique constraints) | 5 | High | Done |
| **DB-05** | DB | Connection Pooling Logic (Mongoose Options) | 3 | High | Done |

---

## 2. Sprint Burndown Data & Backlog Allocation (14 Sprints)

> [!NOTE]
> **Math Verification**: The "Day 1" value in each table is the EXACT sum of the Points (SP) of the assigned Backlog Items.

### Sprint 1: Deployment & ZTA Foundation
**Dates**: May 12 - May 23, 2025
**Sprint Goal**: Establish a reproducible Zero-Trust boundary.
**Sprint Backlog Items**:
*   `ENV-01` (2 SP)
*   `ENV-02` (5 SP)
*   `ENV-04` (1 SP)
*   `SEC-01` (2 SP)
*   `AUT-01` (3 SP)
**Total SP**: 13
**Burndown Data**:

| Day | Ideal | Actual |
| :--- | :--- | :--- |
| Day 1 | 13 | 13 |
| Day 2 | 11.7 | 13 |
| Day 3 | 10.4 | 11 |
| Day 4 | 9.1 | 9 |
| Day 5 | 7.8 | 8 |
| Day 6 | 6.5 | 8 |
| Day 7 | 5.2 | 6 |
| Day 8 | 3.9 | 4 |
| Day 9 | 2.6 | 1 |
| Day 10 | 0 | 0 |

### Sprint 2: The Double-Token Engine
**Dates**: May 26 - June 6, 2025
**Sprint Goal**: Secure session management.
**Sprint Backlog Items**:
*   `AUT-03` (8 SP)
*   `AUT-04` (5 SP)
*   `SEC-04` (5 SP)
**Total SP**: 18
**Burndown Data**:

| Day | Ideal | Actual |
| :--- | :--- | :--- |
| Day 1 | 18 | 18 |
| Day 2 | 16.2 | 16 |
| Day 3 | 14.4 | 12 |
| Day 4 | 12.6 | 12 |
| Day 5 | 10.8 | 10 |
| Day 6 | 9 | 8 |
| Day 7 | 7.2 | 8 |
| Day 8 | 5.4 | 5 |
| Day 9 | 3.6 | 2 |
| Day 10 | 0 | 0 |

### Sprint 3: Asymmetric Identity
**Dates**: June 9 - June 20, 2025
**Sprint Goal**: Client-side cryptography.
**Sprint Backlog Items**:
*   `CRY-01` (8 SP)
*   `UX-01` (5 SP)
*   `UX-02` (3 SP)
**Total SP**: 16
**Burndown Data**:

| Day | Ideal | Actual |
| :--- | :--- | :--- |
| Day 1 | 16 | 16 |
| Day 2 | 14.4 | 15 |
| Day 3 | 12.8 | 13 |
| Day 4 | 11.2 | 13 |
| Day 5 | 9.6 | 10 |
| Day 6 | 8 | 8 |
| Day 7 | 6.4 | 6 |
| Day 8 | 4.8 | 2 |
| Day 9 | 3.2 | 1 |
| Day 10 | 0 | 0 |

### Sprint 4: CRUD & Concurrency Strategy
**Dates**: June 23 - July 4, 2025
**Sprint Goal**: Atomic note management.
**Sprint Backlog Items**:
*   `NOT-01` (5 SP)
*   `NOT-03` (13 SP)
*   `NOT-04` (5 SP)
**Total SP**: 23
**Burndown Data**:

| Day | Ideal | Actual |
| :--- | :--- | :--- |
| Day 1 | 23 | 23 |
| Day 2 | 20.7 | 20 |
| Day 3 | 18.4 | 18 |
| Day 4 | 16.1 | 15 |
| Day 5 | 13.8 | 15 |
| Day 6 | 11.5 | 12 |
| Day 7 | 9.2 | 8 |
| Day 8 | 6.9 | 5 |
| Day 9 | 4.6 | 2 |
| Day 10 | 0 | 0 |

### Sprint 5: Hybrid Encryption Core (Heavy)
**Dates**: July 7 - July 18, 2025
**Sprint Goal**: End-to-end payload security.
**Sprint Backlog Items**:
*   `CRY-02` (13 SP)
*   `CRY-03` (13 SP)
*   `SEC-03` (8 SP)
**Total SP**: 34
**Burndown Data**:

| Day | Ideal | Actual |
| :--- | :--- | :--- |
| Day 1 | 34 | 34 |
| Day 2 | 30.6 | 32 |
| Day 3 | 27.2 | 30 |
| Day 4 | 23.8 | 28 |
| Day 5 | 20.4 | 20 |
| Day 6 | 17 | 15 |
| Day 7 | 13.6 | 12 |
| Day 8 | 10.2 | 8 |
| Day 9 | 6.8 | 4 |
| Day 10 | 0 | 0 |

### Sprint 6: Search-Privacy Paradox
**Dates**: July 21 - Aug 1, 2025
**Sprint Goal**: Ephemeral RAM scanning.
**Sprint Backlog Items**:
*   `CRY-04` (13 SP)
*   `NOT-02` (8 SP)
*   `UX-05` (2 SP)
**Total SP**: 23
**Burndown Data**:

| Day | Ideal | Actual |
| :--- | :--- | :--- |
| Day 1 | 23 | 23 |
| Day 2 | 20.7 | 23 |
| Day 3 | 18.4 | 20 |
| Day 4 | 16.1 | 18 |
| Day 5 | 13.8 | 15 |
| Day 6 | 11.5 | 10 |
| Day 7 | 9.2 | 8 |
| Day 8 | 6.9 | 5 |
| Day 9 | 4.6 | 2 |
| Day 10 | 0 | 0 |

### Sprint 7: Friendship Networking
**Dates**: Aug 4 - Aug 15, 2025
**Sprint Goal**: Permission-based user relations.
**Sprint Backlog Items**:
*   `SOC-01` (8 SP)
*   `SOC-03` (3 SP)
*   `SOC-04` (5 SP)
*   `SEC-09` (2 SP)
**Total SP**: 18
**Burndown Data**:

| Day | Ideal | Actual |
| :--- | :--- | :--- |
| Day 1 | 18 | 18 |
| Day 2 | 16.2 | 16 |
| Day 3 | 14.4 | 14 |
| Day 4 | 12.6 | 12 |
| Day 5 | 10.8 | 10 |
| Day 6 | 9 | 8 |
| Day 7 | 7.2 | 6 |
| Day 8 | 5.4 | 4 |
| Day 9 | 3.6 | 1 |
| Day 10 | 0 | 0 |

### Sprint 8: Secure Collaboration
**Dates**: Aug 18 - Aug 29, 2025
**Sprint Goal**: Dynamic ACL key re-wrapping.
**Sprint Backlog Items**:
*   `CRY-05` (8 SP)
*   `SOC-02` (5 SP)
*   `SOC-05` (3 SP)
*   `NOT-09` (5 SP)
**Total SP**: 21
**Burndown Data**:

| Day | Ideal | Actual |
| :--- | :--- | :--- |
| Day 1 | 21 | 21 |
| Day 2 | 18.9 | 19 |
| Day 3 | 16.8 | 17 |
| Day 4 | 14.7 | 15 |
| Day 5 | 12.6 | 12 |
| Day 6 | 10.5 | 10 |
| Day 7 | 8.4 | 8 |
| Day 8 | 6.3 | 5 |
| Day 9 | 4.2 | 2 |
| Day 10 | 0 | 0 |

### Sprint 9: Defense-in-Depth GA
**Dates**: Sep 1 - Sep 12, 2025
**Sprint Goal**: Global hardening.
**Sprint Backlog Items**:
*   `SEC-02` (3 SP)
*   `SEC-05` (5 SP)
*   `SEC-06` (5 SP)
*   `ADM-04` (8 SP)
**Total SP**: 21
**Burndown Data**:

| Day | Ideal | Actual |
| :--- | :--- | :--- |
| Day 1 | 21 | 21 |
| Day 2 | 18.9 | 18 |
| Day 3 | 16.8 | 16 |
| Day 4 | 14.7 | 14 |
| Day 5 | 12.6 | 11 |
| Day 6 | 10.5 | 9 |
| Day 7 | 8.4 | 7 |
| Day 8 | 6.3 | 4 |
| Day 9 | 4.2 | 1 |
| Day 10 | 0 | 0 |

### Sprint 10: Restriction & Compliance (GDPR)
**Dates**: Sep 15 - Sep 26, 2025
**Sprint Goal**: User limits and right-to-erasure.
**Sprint Backlog Items**:
*   `VER-01` (5 SP)
*   `VER-02` (3 SP)
*   `GDPR-01` (8 SP)
*   `GDPR-02` (3 SP)
**Total SP**: 19
**Burndown Data**:

| Day | Ideal | Actual |
| :--- | :--- | :--- |
| Day 1 | 19 | 19 |
| Day 2 | 17.1 | 19 |
| Day 3 | 15.2 | 16 |
| Day 4 | 13.3 | 14 |
| Day 5 | 11.4 | 10 |
| Day 6 | 9.5 | 10 |
| Day 7 | 7.6 | 8 |
| Day 8 | 5.7 | 4 |
| Day 9 | 3.8 | 2 |
| Day 10 | 0 | 0 |

### Sprint 11: Admin Control Plane
**Dates**: Sep 29 - Oct 10, 2025
**Sprint Goal**: Real-time monitoring.
**Sprint Backlog Items**:
*   `ADM-03` (8 SP)
*   `ADM-05` (5 SP)
*   `VER-05` (5 SP)
*   `VER-06` (5 SP)
**Total SP**: 23
**Burndown Data**:

| Day | Ideal | Actual |
| :--- | :--- | :--- |
| Day 1 | 23 | 23 |
| Day 2 | 20.7 | 21 |
| Day 3 | 18.4 | 19 |
| Day 4 | 16.1 | 16 |
| Day 5 | 13.8 | 14 |
| Day 6 | 11.5 | 10 |
| Day 7 | 9.2 | 8 |
| Day 8 | 6.9 | 4 |
| Day 9 | 4.6 | 2 |
| Day 10 | 0 | 0 |

### Sprint 12: Account Hardening (MFA/RBAC)
**Dates**: Oct 13 - Oct 24, 2025
**Sprint Goal**: Multi-factor identity.
**Sprint Backlog Items**:
*   `AUT-09` (5 SP)
*   `AUT-10` (3 SP)
*   `AUT-11` (5 SP)
*   `ADM-01` (5 SP)
**Total SP**: 18
**Burndown Data**:

| Day | Ideal | Actual |
| :--- | :--- | :--- |
| Day 1 | 18 | 18 |
| Day 2 | 16.2 | 18 |
| Day 3 | 14.4 | 15 |
| Day 4 | 12.6 | 13 |
| Day 5 | 10.8 | 10 |
| Day 6 | 9 | 10 |
| Day 7 | 7.2 | 8 |
| Day 8 | 5.4 | 4 |
| Day 9 | 3.6 | 2 |
| Day 10 | 0 | 0 |

### Sprint 13: Feature Polish
**Dates**: Oct 27 - Nov 7, 2025
**Sprint Goal**: Multimedia support.
**Sprint Backlog Items**:
*   `UPL-01` (5 SP)
*   `UPL-02` (3 SP)
*   `UPL-03` (2 SP)
*   `UX-03` (2 SP)
*   `UX-06` (3 SP)
**Total SP**: 15
**Burndown Data**:

| Day | Ideal | Actual |
| :--- | :--- | :--- |
| Day 1 | 15 | 15 |
| Day 2 | 13.5 | 15 |
| Day 3 | 12 | 12 |
| Day 4 | 10.5 | 10 |
| Day 5 | 9 | 8 |
| Day 6 | 7.5 | 8 |
| Day 7 | 6 | 6 |
| Day 8 | 4.5 | 3 |
| Day 9 | 3 | 1 |
| Day 10 | 0 | 0 |

### Sprint 14: Final QA
**Dates**: Nov 10 - Nov 21, 2025
**Sprint Goal**: Production certification.
**Sprint Backlog Items**:
*   `QA-04` (13 SP)
*   `QA-05` (13 SP)
*   `DOC-03` (5 SP)
**Total SP**: 31
**Burndown Data**:

| Day | Ideal | Actual |
| :--- | :--- | :--- |
| Day 1 | 31 | 31 |
| Day 2 | 27.9 | 30 |
| Day 3 | 24.8 | 28 |
| Day 4 | 21.7 | 25 |
| Day 5 | 18.6 | 15 |
| Day 6 | 15.5 | 12 |
| Day 7 | 12.4 | 10 |
| Day 8 | 9.3 | 5 |
| Day 9 | 6.2 | 2 |
| Day 10 | 0 | 0 |
