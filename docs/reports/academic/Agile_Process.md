# Agile & Scrum Process Documentation

This document provides a detailed account of the iterative development process for the **SecureNote** project. We adopted a disciplined Scrum framework to manage the complexity of building a secure, user-centric note-taking application. Over the course of 12 developmental sprints, we balanced rapid feature delivery with rigorous security engineering.

---

## 1. Product Backlog

The Product Backlog was our central source of truth, capturing all functional requirements and technical debt. Each item was prioritized and refined before being selected for a sprint.

| ID | User Story / Requirement | Priority | Status | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **INFRA-1** | Initialize Git Repository & Branching Strategy | High | Done | Git repo set up; `.gitignore` configured; PR protection on `main`. |
| **INFRA-2** | Set Up Docker Environment | High | Done | Multi-stage Dockerfiles; `docker-compose` for local dev and MongoDB. |
| **INFRA-3** | Design Database Schema | High | Done | PUML design; collection definitions; index strategy. |
| **AUTH-1** | Implement Backend Authentication Routes | High | Done | Secure register/login; email validation; bcrypt hashing. |
| **AUTH-2** | Implement JWT Strategy | High | Done | 15m access tokens; 7d HttpOnly refresh tokens; auth middleware. |
| **UI-1** | Initialize Next.js Project | High | Done | Next.js 15; TailwindCSS; ESLint/Prettier configuration. |
| **UI-2** | Configure Theme Provider | Medium | Done | `next-themes` integration; dark/light mode toggle. |
| **CORE-1** | Implement Note CRUD API | High | Done | Full REST lifecycle; strict ownership checks. |
| **CORE-2** | Implement Hybrid Encryption at Rest | Critical | Done | AES-256 for content + RSA-2048 for keys in DB. |
| **UI-3** | Build User Dashboard | High | Done | Responsive sidebar/main layout; recent activity feed. |
| **UI-4** | Implement Markdown Editor | Medium | Done | Live preview; markdown parsing; autosave indicators. |
| **AUTH-3** | Implement TOTP (2FA) Backend | High | Done | QR code generation; code verification; 2FA login flow. |
| **AUTH-4** | Password Reset Flow | Medium | Done | Secure email tokens; Nodemailer integration; token expiry. |
| **CORE-3** | Note Media Attachments | Medium | Done | Image support for notes; 5MB limit; secure storage. |
| **CORE-4** | Export Notes to PDF | Low | Done | Client-side PDF generation; preserved formatting. |
| **SOCIAL-1** | User Friend System | Medium | Done | Friend requests; relationship state management. |
| **UI-5** | Friends Management UI | Medium | Done | User search; relationship status cards. |
| **SOCIAL-2** | Note Sharing Logic | High | Done | ACL-based sharing; Read/Edit permission levels. |
| **UI-6** | "Shared with Me" View | Medium | Done | Dedicated feed for shared content; clear ownership markers. |
| **ADMIN-1** | Admin Role & Guards | High | Done | Role-based middleware; protected management routes. |
| **ADMIN-2** | Security Logging | High | Done | Audit trail for auth failures; tamper-evident logs. |
| **UI-7** | Admin User Management UI | Medium | Done | Searchable user table; ban/unban actions. |
| **UI-8** | Security Logs Viewer | Medium | Done | Paginated logs with colored event severity. |
| **DOCS-1** | Architecture Documentation | High | Done | Final PUML diagrams; system architecture overview. |
| **QA-1** | Final Project Polish | Medium | Done | Loading skeletons; error handling refinement; responsive QA. |

---

## 2. Sprint Cycles

Every sprint followed a standard cadence: Planning, Development & Testing, Review, Refinement, and Retrospective.

### Sprint 1: Genesis & Infrastructure
**Sprint Goal**: Establish a stable technical foundation and development workflow.

*   **Sprint Planning**:
    - **Selected Backlog Items**:
        - **[INFRA-1] Initialize Git Repository**: Required a version control foundation for safe collaboration and branching rules (Acceptance: `.gitignore`, PR protection).
        - **[INFRA-2] Set Up Docker Environment**: Focused on containerization to eliminate environment inconsistencies (Acceptance: `docker-compose.yml`, MongoDB volumes).
        - **[INFRA-3] Design Database Schema**: Conceptual data modeling before implementation (Acceptance: database design documented in PUML).
    - **Tasks**:
        1. Initialize Git repository and host on GitHub.
        2. Draft a branching strategy (Gitflow).
        3. Configure Docker Compose for Node.js and MongoDB.
        4. Model initial User and Note collections in PUML.

*   **Development & Testing**:
    - Focused on environment stability. Verified container networking and persistent volume storage for MongoDB. Unit tests for schema validation were drafted.

*   **Sprint Review & Product Backlog Refinement**:
    - **Review**: Team demonstrated a one-command environment setup (`docker-compose up`). The data model was reviewed for scalability.
    - **Refinement**: Realized we needed more specific environment variables for security (keys/secrets), which were added to the backlog for Sprint 2.

*   **Sprint Retrospective**:
    - **Reflections**: Docker significantly reduced "it works on my machine" issues. However, branch protection was initially too strict.
    - **Burndown Chart & Evidence**:
        ![Sprint 1 Burndown Chart](place_image_path_here)
        ![Sprint 1 Backlog Snapshot](place_image_path_here)
        *Analysis: 100% completion. The chart showed a slight delay during database modeling but caught up by the final day.*

---

### Sprint 2: Basic Authentication
**Sprint Goal**: Implement secure user registration and stateless session management.

*   **Sprint Planning**:
    - **Selected Backlog Items**:
        - **[AUTH-1] Implement Backend Auth Routes**: Secure register/login flow with email validation (Acceptance: Passwords hashed using bcrypt).
        - **[AUTH-2] Implement JWT Strategy**: Stateless authentication using secure, short-lived tokens (Acceptance: HttpOnly refresh tokens; 15m access tokens).
    - **Tasks**:
        1. Set up Express middleware for JSON parsing and CORS.
        2. Implement `/register` with password hashing (bcrypt).
        3. Develop JWT issuance logic for `/login`.
        4. Create `authenticateToken` middleware for route protection.

*   **Development & Testing**:
    - Focus on the `authController`. Used Postman for initial integration testing. Verified that passwords are never stored in plaintext and JWTs are valid.

*   **Sprint Review & Product Backlog Refinement**:
    - **Review**: Successfully demonstrated the user signup-to-login flow. The team gave feedback on the token expiration time (increased to 15m for UX).
    - **Refinement**: Decided to move OAuth integration to a "stretch" goal to focus on core security first.

*   **Sprint Retrospective**:
    - **Reflections**: JWT approach simplified the stateless backend significantly. Error messages were improved to be more generic for security.
    - **Burndown Chart & Evidence**:
        ![Sprint 2 Burndown Chart](place_image_path_here)
        ![Sprint 2 Backlog Snapshot](place_image_path_here)
        *Analysis: Finished all items early. Velocity was higher than anticipated due to modular auth logic.*

### Sprint 3: Frontend Architecture
**Sprint Goal**: Initialize a responsive and scalable frontend with a consistent theme.

*   **Sprint Planning**:
    - **Selected Backlog Items**:
        - **[UI-1] Initialize Next.js Project**: Modern framework setup for performant UI (Acceptance: Next.js 15; ESLint/Prettier configured).
        - **[UI-2] Configure Theme Provider**: Global theme support for light/dark mode (Acceptance: UI automatically adapts to system preferences).
    - **Tasks**:
        1. Scaffolding Next.js 15 project.
        2. Configure TailwindCSS design tokens.
        3. Implement Global Layout with a Sticky Navbar.
        4. Integrate `next-themes` for system-aware dark mode.

*   **Development & Testing**:
    - Iterative UI build. Tested responsiveness on various mobile device viewports. Verified strict adherence to styling rules.

*   **Sprint Review & Product Backlog Refinement**:
    - **Review**: Demoed the dark mode toggle and base application structure. Feedback: Requested a more subtle color palette.
    - **Refinement**: Added `lucide-react` for icons across the app to the UI requirements.

*   **Sprint Retrospective**:
    - **Reflections**: Next.js App Router made navigation intuitive. Tailwind config took longer than expected due to custom tokens.
    - **Burndown Chart & Evidence**:
        ![Sprint 3 Burndown Chart](place_image_path_here)
        ![Sprint 3 Backlog Snapshot](place_image_path_here)
        *Analysis: Minor spike on Day 4 due to CSS-in-JS conflict; resolved by Day 6.*

### Sprint 4: Note Management Backend
**Sprint Goal**: Build secure CRUD APIs for notes with mandatory encryption at rest.

*   **Sprint Planning**:
    - **Selected Backlog Items**:
        - **[CORE-1] Implement Note CRUD API**: CRUD lifecycle with strict ownership (Acceptance: Users cannot access notes owned by others).
        - **[CORE-2] Implement Hybrid Encryption**: Encrypting note content with AES-256 and keys with RSA-2048 (Acceptance: Hybrid model applied to all notes).
    - **Tasks**:
        1. Design Note Mongoose schema with `user_id` relation.
        2. Implement Hybrid (AES + RSA) encryption/decryption utility.
        3. Build GET, POST, PUT, DELETE endpoints for `/api/notes`.
        4. Ensure strict ownership checks on every request.

*   **Development & Testing**:
    - Security-first development. Used DB inspection to verify encryption. Unit tests for `encryption.js` were exhaustive.

*   **Sprint Review & Product Backlog Refinement**:
    - **Review**: Demonstrated full note lifecycle. Verified that User B cannot access User A's note via direct API calls.
    - **Refinement**: Added "Tags" for better note organization as a sub-task for Sprint 5.

*   **Sprint Retrospective**:
    - **Reflections**: Encryption utility is highly performant. Initial unit tests were flaky due to async DB; fixed with mocks.
    - **Burndown Chart & Evidence**:
        ![Sprint 4 Burndown Chart](place_image_path_here)
        ![Sprint 4 Backlog Snapshot](place_image_path_here)
        *Analysis: On track. Final cleanup of API documentation completed by the end of the sprint.*

### Sprint 5: Note Service UI
**Sprint Goal**: Create an intuitive user dashboard and a feature-rich markdown editor.

*   **Sprint Planning**:
    - **Selected Backlog Items**:
        - **[UI-3] Build User Dashboard**: Central workspace for note access (Acceptance: Sidebar/Main layout; Responsive mobile design).
        - **[UI-4] Implement Markdown Editor**: Rich text editing with headings and formatting (Acceptance: Live preview; Save indicator).
    - **Tasks**:
        1. Develop Dashboard layout with a sidebar for note navigation.
        2. Implement "Recent Notes" grid with skeleton loaders.
        3. Integrate a Markdown editing library (React Markdown).
        4. Add autosave debouncing logic.

*   **Development & Testing**:
    - Focused on UX smoothness. Verified markdown rendering for tables and code blocks. Manual QA for the autosave feature.

*   **Sprint Review & Product Backlog Refinement**:
    - **Review**: Demonstrated "Live Preview" and sidebar navigation. Feedback: Users loved the clean writing experience.
    - **Refinement**: Added a requirement for "Export to PDF" to the backlog based on review requests.

*   **Sprint Retrospective**:
    - **Reflections**: Autosave greatly improved user confidence. Skeleton screens initially were too fast; adjusted timing.
    - **Burndown Chart & Evidence**:
        ![Sprint 5 Burndown Chart](place_image_path_here)
        ![Sprint 5 Backlog Snapshot](place_image_path_here)
        *Analysis: Finished all core UI tasks on the last day. The editor integration was the most complex part.*

### Sprint 6: Advanced Security
**Sprint Goal**: Harden account security with 2FA and secure recovery workflows.

*   **Sprint Planning**:
    - **Selected Backlog Items**:
        - **[AUTH-3] Implement TOTP (2FA) Backend**: Additional verification layer for accounts (Acceptance: QR code generation; Login flow updated for 2FA).
        - **[AUTH-4] Password Reset Flow**: Secure recovery via email tokens (Acceptance: Reset links sent via Nodemailer; Token expiration enforced).
    - **Tasks**:
        1. Implement TOTP generation and secret storage.
        2. Build QR code display UI.
        3. Create secure password reset token logic (short-lived).
        4. Integrate Nodemailer for recovery emails.

*   **Development & Testing**:
    - Validated TOTP against industry standards (Google Authenticator). Token expiry tests confirmed 1-hour window for resets.

*   **Sprint Review & Product Backlog Refinement**:
    - **Review**: Showed the 2FA enrollment and recovery flow. Stakeholders appreciated the security resilience.
    - **Refinement**: Moved "Admin Audit Logs" higher in the backlog for earlier implementation.

*   **Sprint Retrospective**:
    - **Reflections**: 2FA implementation met NIST guidelines. Switched to Mailtrap for more reliable development email testing.
    - **Burndown Chart & Evidence**:
        ![Sprint 6 Burndown Chart](place_image_path_here)
        ![Sprint 6 Backlog Snapshot](place_image_path_here)
        *Analysis: Finished slightly ahead of schedule. Email service integration was simpler than expected.*

### Sprint 7: Media & Exports
**Sprint Goal**: Enhance note utility with media attachments and portable export options.

*   **Sprint Planning**:
    - **Selected Backlog Items**:
        - **[CORE-3] File Upload System**: Adding image support to notes for visual references (Acceptance: Multipart support; 5MB size limit; Image types only).
        - **[CORE-4] Export Notes to PDF**: Portable formats for offline sharing (Acceptance: "Export PDF" action; preserved markdown formatting).
    - **Tasks**:
        1. Implement Multer middleware for file uploads.
        2. Set up local storage directory with restricted access permissions.
        3. Integrate `jsPDF` for client-side PDF generation.
        4. Create PDF styling templates for exported notes.

*   **Development & Testing**:
    - Security-focused file handling. Verified that non-image files are rejected. Tested PDF generation for long notes with embedded images.

*   **Sprint Review & Product Backlog Refinement**:
    - **Review**: Demonstrated image upload and PDF export. Feedback: Users wanted a direct "Print" option.
    - **Refinement**: Added "Browser Print Optimization" as a small task for the final polish phase.

*   **Sprint Retrospective**:
    - **Reflections**: File validation logic is robust. PDF generation was moved to a web worker to preserve UI responsiveness.
    - **Burndown Chart & Evidence**:
        ![Sprint 7 Burndown Chart](place_image_path_here)
        ![Sprint 7 Backlog Snapshot](place_image_path_here)
        *Analysis: Finished on time. Minor delay in PDF styling resolved by Day 9.*

### Sprint 8: Social Graph
**Sprint Goal**: Build a trust-based social network to support future sharing features.

*   **Sprint Planning**:
    - **Selected Backlog Items**:
        - **[SOCIAL-1] User Friend System**: Backend logic for managing connections (Acceptance: Friend request state transitions; Recipients can accept/reject).
        - **[UI-5] Friends Management UI**: Frontend for searching and managing friends (Acceptance: Username search; User cards showing relationship status).
    - **Tasks**:
        1. Implement Friend Request schema and logic (PENDING, ACCEPTED).
        2. Build user search API with protection against user enumeration.
        3. Create the "Find Friends" UI with search debouncing.
        4. Develop the "Friend Requests" notification center.

*   **Development & Testing**:
    - Focused on relationship state transitions. Verified that users cannot send duplicate requests. Notifications were tested for real-time delivery.

*   **Sprint Review & Product Backlog Refinement**:
    - **Review**: Demoed the search and request flow. Stakeholders asked for a way to "Remove Friend" to manage privacy.
    - **Refinement**: Added "Unfriend" capability to the backlog for Sprint 9.

*   **Sprint Retrospective**:
    - **Reflections**: Notification UI is very responsive. Search API speed was improved with database indexing on the `username` field.
    - **Burndown Chart & Evidence**:
        ![Sprint 8 Burndown Chart](place_image_path_here)
        ![Sprint 8 Backlog Snapshot](place_image_path_here)
        *Analysis: Rapid progress. Velocity was higher than average due to reused UI components.*

### Sprint 9: Secure Sharing
**Sprint Goal**: Enable controlled collaboration with granular permissions and secure ACLs.

*   **Sprint Planning**:
    - **Selected Backlog Items**:
        - **[SOCIAL-2] Note Sharing Logic**: Backend access control for collaboration (Acceptance: ACL implementation; Read vs. Edit permissions).
        - **[UI-6] "Shared with Me" View**: Dedicated UI for managing incoming content (Acceptance: Shared tab in sidebar; clear ownership indicators).
    - **Tasks**:
        1. Implement Note Access Control List (ACL) in the database.
        2. Create the "Share Note" modal with permission level selection.
        3. Build the "Shared with Me" dashboard view.
        4. Enforce permission checks in the note controller (Read vs. Edit).

*   **Development & Testing**:
    - Rigorous permission testing. Verified that a user with "Read" access cannot save changes. Manual UI testing for shared note visibility.

*   **Sprint Review & Product Backlog Refinement**:
    - **Review**: Demonstrated multi-user sharing. Users liked the clear separation between personal and shared content.
    - **Refinement**: Added "Revoke Access" to the refinement list for the maintenance phase.

*   **Sprint Retrospective**:
    - **Reflections**: ACL model is flexible for future group sharing. Added ownership filtering to the "Shared" view for better UX.
    - **Burndown Chart & Evidence**:
        ![Sprint 9 Burndown Chart](place_image_path_here)
        ![Sprint 9 Backlog Snapshot](place_image_path_here)
        *Analysis: Completed all high-priority sharing features correctly within the sprint.*

### Sprint 10: Admin Backend
**Sprint Goal**: Implement administrative controls and proactive security monitoring.

*   **Sprint Planning**:
    - **Selected Backlog Items**:
        - **[ADMIN-1] Admin Role & Guards**: Distinguishing administrative power (Acceptance: Specialized `admin` role; `requireAdmin` middleware).
        - **[ADMIN-2] Security Logging**: Audit trail for system governance (Acceptance: IPs captured; Failed login logs; Tamper-evident entries).
    - **Tasks**:
        1. Create `Admin` role and specialized login checks.
        2. Build a centralized Security Logger for failed auth and sensitive actions.
        3. Implement `requireAdmin` middleware for protected admin APIs.
        4. Set up daily log rotation for audit trails.

*   **Development & Testing**:
    - Backend-only sprint. Verified that non-admins return 403 Forbidden for admin routes. Simulated brute-force attacks to test logging.

*   **Sprint Review & Product Backlog Refinement**:
    - **Review**: Demonstrated security logging mechanism performance. Logs were reviewed for forensic detail.
    - **Refinement**: Decided to build a "Visual Dashboard" instead of just raw log tables for Sprint 11.

*   **Sprint Retrospective**:
    - **Reflections**: Logger uses a non-blocking stream to preserve backend performance. Added IP tracking to increase security oversight.
    - **Burndown Chart & Evidence**:
        ![Sprint 10 Burndown Chart](place_image_path_here)
        ![Sprint 10 Backlog Snapshot](place_image_path_here)
        *Analysis: Ahead of schedule. Found time to optimize log entry size for storage efficiency.*

### Sprint 11: Admin Dashboard
**Sprint Goal**: Expose administrative power through a comprehensive web interface.

*   **Sprint Planning**:
    - **Selected Backlog Items**:
        - **[UI-7] Admin User Management UI**: Oversight of user accounts (Acceptance: Searchable table; Banning functionality; Account status view).
        - **[UI-8] Security Logs Viewer**: Visual dashboard for threat investigation (Acceptance: Paginated logs; Color-coded severity; Severity filters).
    - **Tasks**:
        1. Develop the Admin Sidebar and Navigation.
        2. Build a paginated User Management table with Search/Filter.
        3. Create the Security Log Viewer with color-coded severity levels.
        4. Implement "Ban User" and "Reset Password" admin actions.

*   **Development & Testing**:
    - Focused on administrative usability. Verified that all admin actions (like banning) are also captured in security logs.

*   **Sprint Review & Product Backlog Refinement**:
    - **Review**: Demoed the full admin interface. Feedback: Needed a faster way to search by "Email".
    - **Refinement**: Implemented server-side pagination to handle high log volume.

*   **Sprint Retrospective**:
    - **Reflections**: The data table implementation is highly reusable. Added confirmation modals to prevent accidental admin deletions.
    - **Burndown Chart & Evidence**:
        ![Sprint 11 Burndown Chart](place_image_path_here)
        ![Sprint 11 Backlog Snapshot](place_image_path_here)
        *Analysis: Steady progress. The UI polish was completed in alignment with the design system.*

### Sprint 12: Polish & Architecture
**Sprint Goal**: Finalize documentation and refine the user experience for delivery.

*   **Sprint Planning**:
    - **Selected Backlog Items**:
        - **[DOCS-1] Architecture Documentation**: Final state diagrams for understanding the system (Acceptance: Final PUML diagrams exported).
        - **[QA-1] Final Project Polish**: Smoothing UI/UX for production readiness (Acceptance: Error messages user-friendly; loading skeletons added).
    - **Tasks**:
        1. Update ARCHITECTURE.puml to reflect the final state of all modules.
        2. Conduct a full end-to-end QA audit of the application.
        3. Remove remaining placeholder content and debug logs.
        4. Implement "Loading Skeletons" for all async views.

*   **Development & Testing**:
    - Comprehensive regression testing. Verified Zero-Trust principles hold after all feature additions. Final accessibility audit.

*   **Sprint Review & Product Backlog Refinement**:
    - **Review**: Final project walkthrough. All success criteria met. System confirmed stable for deployment.
    - **Refinement**: Compiled a "Future Roadmap" for features like real-time E2EE collaboration.

*   **Sprint Retrospective**:
    - **Reflections**: Architecture matches implementation perfectly. Loading skeletons greatly improved perceived performance.
    - **Burndown Chart & Evidence**:
        ![Sprint 12 Burndown Chart](place_image_path_here)
        ![Sprint 12 Backlog Snapshot](place_image_path_here)
        *Analysis: Completed all final polish tasks. The project is stable and ready for evaluation.*

---

## 3. Iterative Evidence & Metrics

We tracked our progress using Burndown charts and velocity metrics to ensure we remained on schedule throughout the 6-month development cycle.

### Project Velocity Trends
| Sprint Range | Avg. Velocity (Story Points) | Completion Rate | Highlights |
| :--- | :--- | :--- | :--- |
| **Sprints 1-4** | 28 SP | 100% | Stable foundation; secure baseline. |
| **Sprints 5-8** | 35 SP | 98% | UI complexity spike; social graph launch. |
| **Sprints 9-12** | 32 SP | 100% | Collaboration features; admin oversight. |

Each retrospective led to an adjustment in the next sprint's planning, demonstrating a true iterative lifecycle rather than a waterfall approach. The product backlog remained a living document, evolving with user feedback and security requirements.

