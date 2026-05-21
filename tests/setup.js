// tests/setup.js
// Mock global del pool de PostgreSQL.
// Cada test define el comportamiento con mockResolvedValueOnce.

jest.mock('../src/db/pool', () => ({
  query: jest.fn(),
  on: jest.fn(),
}));
