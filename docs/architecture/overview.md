# Architecture Overview

## System Architecture

SecureNote follows a modern **three-tier architecture** with clear separation of concerns:

1. **Presentation Layer** (Frontend - Next.js)
2. **Business Logic Layer** (Backend - Express.js)
3. **Data Layer** (MongoDB)

## Backend Architecture

The backend is organized using a **layered MVC pattern** with the following structure:

```
backend/src/
├── config/          # Configuration files (database, passport)
├── constants/       # Application constants
├── controllers/     # Request handlers
├── dto/             # Data Transfer Objects
├── errors/          # Custom error classes
├── middleware/      # Express middleware
├── models/          # Mongoose schemas
├── routes/          # API route definitions
├── services/        # Business logic layer
│   ├── auth/        # Authentication services
│   ├── note/        # Note-related services
│   ├── user/        # User-related services
│   └── shared/      # Shared services
├── utils/           # Utility functions
├── validators/      # Input validation
├── app.js           # Express app setup
└── server.js        # Server entry point
```

### Key Design Patterns

- **MVC Pattern**: Separation of routes, controllers, and models
- **Service Layer**: Business logic separated from controllers
- **Repository Pattern**: Data access through Mongoose models
- **Middleware Chain**: Security, authentication, validation

## Frontend Architecture

The frontend uses **Next.js App Router** with a feature-based organization:

```
frontend/src/
├── app/                    # Next.js pages
│   ├── (auth)/            # Auth route group
│   ├── (dashboard)/       # Dashboard route group
│   ├── (admin)/           # Admin route group
│   ├── layout.tsx
│   └── page.tsx
├── components/            # Shared components
├── features/              # Feature modules
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and helpers
│   ├── api/              # API client
│   └── utils/            # Helper functions
├── services/              # API service layer
├── types/                 # TypeScript types
├── context/               # React Context
└── constants/             # Application constants
```

### Key Design Patterns

- **Feature-Based Organization**: Related code grouped by feature
- **Route Groups**: Logical grouping of pages
- **Service Layer**: API calls abstracted into services
- **Custom Hooks**: Reusable stateful logic
- **Context API**: Global state management

## Security Architecture

SecureNote implements **Zero Trust Architecture**:

- **Authentication**: JWT-based with refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Encryption**: Hybrid encryption (RSA + AES)
- **Input Validation**: Server-side validation with express-validator
- **Rate Limiting**: API rate limiting to prevent abuse
- **Security Headers**: Helmet.js for security headers

## Data Flow

1. **User Request** → Frontend (Next.js)
2. **API Call** → Service Layer (axios)
3. **HTTP Request** → Backend API (Express)
4. **Middleware** → Authentication, Validation, Sanitization
5. **Controller** → Request handling
6. **Service** → Business logic
7. **Model** → Database operations (Mongoose)
8. **Database** → MongoDB
9. **Response** → Back through the layers

## Deployment Architecture

- **Containerization**: Docker for consistent environments
- **Orchestration**: Docker Compose for multi-container setup
- **Environment**: Separate dev and production configurations
