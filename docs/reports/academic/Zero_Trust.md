# Zero Trust Architecture Implementation

## Principles & Philosophy
SecureNote adopts a **Zero Trust Architecture (ZTA)** based on the core maxim: *"Never Trust, Always Verify"*. Unlike traditional perimeter-based security, our model assumes that threats exist both outside and inside the network. Therefore, no user or system is implicitly trusted based on their location or network access.

## Implementation Mapping
The following table maps core ZTA principles to specific technical implementations in SecureNote:

| NFR Category | Implementation | Validation Method |
| :--- | :--- | :--- |
| **Never Trust, Always Verify** | Every single API request is stateless and verified via JWT middleware (`passport-jwt`). No "internal" or "safe" routes exist. | `authenticate` Middleware on all `/api/notes` routes. |
| **Least Privilege** | Role-Based Access Control (RBAC) separates 'User' and 'Admin'. Friends have granular 'Viewer' vs 'Editor' permissions. | Controllers check `req.user.role` or `sharedWith.permission` before action. |
| **Assume Breach** | Data is encrypted at rest (DB) and sensitive fields are encrypted in transit. CSP prevents XSS even if frontend is compromised. | Helmet.js policies + AES Encryption. |
| **Continuous Validation** | Tokens have short lifespans. Access to resources (Notes) involves a secondary check of ownership/sharing *at the time of access*. | `noteController.js`: `Note.findOne({_id: id, owner: req.user.id})` checks relationship every time. |

## Sequence Diagram: API Request Under Zero Trust Model

**Diagram File**: [`diagrams/zero_trust_api_request.puml`](diagrams/zero_trust_api_request.puml)

This diagram illustrates the continuous verification process for every API request:
1. **Identity Verification**: JWT token signature and expiry validated
2. **Context Verification**: Ownership/permissions checked at request time
3. **Logic Verification**: Optimistic locking prevents concurrent conflicts

The diagram shows how SecureNote implements "Never Trust, Always Verify" at multiple layers.
