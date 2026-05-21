// tests/authors.test.js
require('./setup');

const request = require('supertest');
const app     = require('../src/app');
const pool    = require('../src/db/pool');

// ─────────────────────────────────────────────────────────────
// GET /authors
// ─────────────────────────────────────────────────────────────
describe('GET /authors', () => {
  it('debe retornar lista de autores con 200', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        { id: 1, name: 'Ana García', email: 'ana@example.com', bio: null, created_at: new Date() },
        { id: 2, name: 'Carlos Ruiz', email: 'carlos@example.com', bio: null, created_at: new Date() },
      ],
    });

    const res = await request(app).get('/authors');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toHaveProperty('email', 'ana@example.com');
  });
});

// ─────────────────────────────────────────────────────────────
// GET /authors/:id
// ─────────────────────────────────────────────────────────────
describe('GET /authors/:id', () => {
  it('debe retornar el autor cuando existe', async () => {
    const fakeAuthor = { id: 1, name: 'Ana García', email: 'ana@example.com', bio: null, created_at: new Date() };
    pool.query.mockResolvedValueOnce({ rows: [fakeAuthor] });

    const res = await request(app).get('/authors/1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 1);
  });

  it('debe retornar 404 cuando el autor no existe', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/authors/999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

// ─────────────────────────────────────────────────────────────
// POST /authors
// ─────────────────────────────────────────────────────────────
describe('POST /authors', () => {
  it('debe crear un autor y retornar 201', async () => {
    const newAuthor = { id: 4, name: 'Test User', email: 'test@example.com', bio: null, created_at: new Date() };
    pool.query.mockResolvedValueOnce({ rows: [newAuthor] });

    const res = await request(app)
      .post('/authors')
      .send({ name: 'Test User', email: 'test@example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id', 4);
    expect(res.body).toHaveProperty('email', 'test@example.com');
  });

  it('debe retornar 400 si falta el name', async () => {
    const res = await request(app)
      .post('/authors')
      .send({ email: 'sin-nombre@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/name/i);
  });

  it('debe retornar 400 si falta el email', async () => {
    const res = await request(app)
      .post('/authors')
      .send({ name: 'Sin Email' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });

  it('debe retornar 400 si el email ya existe (error 23505)', async () => {
    const pgError = new Error('duplicate key');
    pgError.code  = '23505';
    pool.query.mockRejectedValueOnce(pgError);

    const res = await request(app)
      .post('/authors')
      .send({ name: 'Duplicado', email: 'ana@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });
});

// ─────────────────────────────────────────────────────────────
// PUT /authors/:id
// ─────────────────────────────────────────────────────────────
describe('PUT /authors/:id', () => {
  it('debe actualizar un autor existente', async () => {
    const updated = { id: 1, name: 'Ana Actualizada', email: 'ana@example.com', bio: 'Nueva bio', created_at: new Date() };
    pool.query.mockResolvedValueOnce({ rows: [updated] });

    const res = await request(app)
      .put('/authors/1')
      .send({ name: 'Ana Actualizada', email: 'ana@example.com', bio: 'Nueva bio' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Ana Actualizada');
  });

  it('debe retornar 404 si el autor no existe', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .put('/authors/999')
      .send({ name: 'No existe', email: 'noexiste@example.com' });

    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────
// DELETE /authors/:id
// ─────────────────────────────────────────────────────────────
describe('DELETE /authors/:id', () => {
  it('debe eliminar un autor existente y retornar 204', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1 });

    const res = await request(app).delete('/authors/1');
    expect(res.status).toBe(204);
  });

  it('debe retornar 404 si el recurso no existe', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 0 });

    const res = await request(app).delete('/authors/999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
