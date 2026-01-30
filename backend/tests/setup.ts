// Global test setup for backend tests
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/venn_test';
process.env.SESSION_SECRET = 'test-secret-key-for-testing-only';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing';
