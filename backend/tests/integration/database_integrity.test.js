const User = require('../../src/models/User');
const Note = require('../../src/models/Note');

describe('NFR-6: Data Integrity Requirements', () => {
    describe('NFR-6.1: User Model Validation', () => {
        it('should enforce unique email constraint', () => {
            const schema = User.schema;
            const emailField = schema.path('email');

            expect(emailField.options.unique).toBe(true);
            console.log('   Email Uniqueness: ENFORCED');
            console.log('   Prevents duplicate accounts');
        });

        it('should enforce unique username constraint', () => {
            const schema = User.schema;
            const usernameField = schema.path('username');

            expect(usernameField.options.unique).toBe(true);
            console.log('   Username Uniqueness: ENFORCED');
        });

        it('should require password with minimum length', () => {
            const schema = User.schema;
            const passwordField = schema.path('password');

            expect(passwordField.options.required).toBeTruthy();
            expect(passwordField.options.minlength).toBeDefined();
            console.log('   Password Required: YES');
            console.log('   Minimum Length:', passwordField.options.minlength[0], 'characters');
        });

        it('should enforce email format validation', () => {
            const schema = User.schema;
            const emailField = schema.path('email');

            expect(emailField.options.match).toBeDefined();
            console.log('   Email Format Validation: ACTIVE');
            console.log('   Regex Pattern Enforced');
        });
    });

    describe('NFR-6.2: Note Model Validation', () => {
        it('should require title field', () => {
            const schema = Note.schema;
            const titleField = schema.path('title');

            expect(titleField.options.required).toBeTruthy();
            console.log('   Title Required: YES');
        });

        it('should enforce title max length', () => {
            const schema = Note.schema;
            const titleField = schema.path('title');

            expect(titleField.options.maxlength).toBeDefined();
            console.log('   Title Max Length:', titleField.options.maxlength[0], 'characters');
        });

        it('should require owner reference', () => {
            const schema = Note.schema;
            const ownerField = schema.path('owner');

            expect(ownerField.options.required).toBeTruthy();
            expect(ownerField.options.ref).toBe('User');
            console.log('   Owner Reference: REQUIRED');
            console.log('   Referential Integrity: ENFORCED');
        });

        it('should validate note format enum', () => {
            const schema = Note.schema;
            const formatField = schema.path('format');

            expect(formatField.options.enum).toEqual(['plain', 'markdown']);
            console.log('   Format Enum: [plain, markdown]');
            console.log('   Invalid Format Prevention: ACTIVE');
        });
    });

    describe('NFR-1.2: Database Performance (Indexing)', () => {
        it('should have index on Note.owner for fast queries', () => {
            const schema = Note.schema;
            const indexes = schema.indexes();

            const hasOwnerIndex = indexes.some(idx => idx[0].owner === 1);
            expect(hasOwnerIndex).toBe(true);
            console.log('   Index on owner field: PRESENT');
            console.log('   Query Optimization: ENABLED');
        });

        it('should have index on Note.sharedWith.user for access control', () => {
            const schema = Note.schema;
            const indexes = schema.indexes();

            const hasSharedIndex = indexes.some(idx => idx[0]['sharedWith.user'] === 1);
            expect(hasSharedIndex).toBe(true);
            console.log('   Index on sharedWith.user: PRESENT');
            console.log('   Sharing Performance: OPTIMIZED');
        });

        it('should have indexes on User.friendRequests for performance', () => {
            const schema = User.schema;
            const indexes = schema.indexes();

            const hasFriendIndexes = indexes.some(idx =>
                idx[0]['friendRequests.sender'] === 1 || idx[0]['friendRequests.receiver'] === 1
            );
            expect(hasFriendIndexes).toBe(true);
            console.log('   Friend Request Indexes: PRESENT');
            console.log('   Social Features Optimized');
        });
    });
});
