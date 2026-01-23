# Architecture Diagrams

## Complex Method: Secure Note Sharing
This sequence diagram details the process of sharing an encrypted note with another user, ensuring key exchange handling.

```mermaid
sequenceDiagram
    participant Owner
    participant API
    participant DB
    participant Friend

    Owner->>API: POST /notes/:id/share (Target: Friend)
    API->>DB: Find Friend & Get Public Key
    DB-->>API: Return Friend's Public Key
    API->>DB: Find Note (Check Ownership)
    DB-->>API: Return Note Data
    
    API->>API: Encrypt Note Key/Content using Friend's Public Key
    
    API->>DB: Update Note (Push to sharedWith array)
    DB-->>API: Success
    API-->>Owner: 200 OK (Shared)
```

## "Live Note Modification" Handling
activity diagram ensuring data consistency when two users edit the same note.

```mermaid
graph TD
    A[User A fetches Note (Ver 1)] --> B(Editing in UI)
    C[User B fetches Note (Ver 1)] --> D(Editing in UI)
    B --> E[User A Submits Update (Current Ver: 1)]
    E --> F{DB: matches Ver 1?}
    F -- Yes --> G[Update Success (Ver -> 2)]
    D --> H[User B Submits Update (Current Ver: 1)]
    H --> I{DB: matches Ver 1?}
    G -.-> I
    I -- No (Current DB is Ver 2) --> J[Update Failed (409 Conflict)]
    J --> K[User B notified to refresh]
```
