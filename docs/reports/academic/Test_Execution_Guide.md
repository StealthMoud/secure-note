# Test Execution Guide for Report Screenshots

## Running the Complete Test Suite

Execute the following command from the backend directory:

```bash
cd backend
npm test
```

## Test Categories Covered

### 1. **NFR-1: Performance Requirements**
- API Response Time validation (<100ms target)
- Database indexing verification

### 2. **NFR-3: Reliability & Availability**
- Error handling verification
- 404 response structure

### 3. **NFR-5: Security Requirements**
- **NFR-5.1**: Security Headers (Helmet.js)
  - Content-Security-Policy
  - X-Frame-Options (Clickjacking prevention)
  - X-Content-Type-Options (MIME sniffing prevention)
- **NFR-5.3**: Rate Limiting
  - Rate limit headers present
  - Request throttling active
- **NFR-5.4**: Input Validation
  - Empty field rejection
  - Format enum validation
  - XSS/SQL injection prevention

### 4. **NFR-6: Data Integrity**
- User model constraints (unique email, username)
- Password requirements
- Note model validation
- Referential integrity
- Database indexes for performance

### 5. **NFR-1.4: Concurrency Control**
- Optimistic locking implementation
- Version conflict detection (409 responses)
- Version increment mechanism

## Screenshot Recommendations

### For Best Visual Results:
1. **Terminal Width**: Set to at least 120 characters for clean output
2. **Font**: Use a monospace font (e.g., Monaco, Consolas)
3. **Capture**: Include the full test suite output showing:
   - Test suite names
   - Individual test descriptions
   - Individual test descriptions
   - Console log output
   - Final summary (X passed, Y total)

### Key Sections to Highlight:
- **Concurrency Tests**: Show the scenario descriptions and conflict handling
- **Security Headers**: Display the actual header values
- **Input Validation**: Show the rejection messages
- **Database Integrity**: Show the constraint enforcement

## Expected Output Summary
```
Test Suites: 4 passed, 4 total
Tests:       23 passed, 23 total
```

All tests include descriptive console output explaining what is being validated and the results.
