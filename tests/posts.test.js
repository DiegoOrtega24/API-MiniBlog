// tests/posts.test.js
require('./setup');

const request = require('supertest');
const app     = require('../src/app');
const pool    = require('../src/db/pool');

// ─────────────────────────────────────────────────────────────
// GET /posts
// ─────────────────────────────────────────────────────────────
describe('GET /posts', () => {
  it('debe retornar lista de posts con 200', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        { id: 1, title: 'Post 1', content: 'Contenido', author_id: 1, published: true, created_at: new Date() },
      ],
    });

    const res = await request(app).get('/posts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('title', 'Post 1');
  });
});

// ─────────────────────────────────────────────────────────────
// GET /posts/:id
// ─────────────────────────────────────────────────────────────
describe('GET /posts/:id', () => {
  it('debe retornar el post cuando existe', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, title: 'Post 1', content: 'Contenido', author_id: 1, published: true, created_at: new Date() }],
    });

    const res = await request(app).get('/posts/1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 1);
  });

  it('debe retornar 404 cuando el post no existe', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/posts/999');
    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────
// GET /posts/author/:authorId
// ─────────────────────────────────────────────────────────────
describe('GET /posts/author/:authorId', () => {
  it('debe retornar posts con datos del autor', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id: 1, title: 'Post 1', content: 'Contenido', published: true, created_at: new Date(),
          author: { id: 1, name: 'Ana García', email: 'ana@example.com', bio: null },
        },
      ],
    });

    const res = await request(app).get('/posts/author/1');
    expect(res.status).toBe(200);
    expect(res.body[0]).toHaveProperty('author');
    expect(res.body[0].author).toHaveProperty('name', 'Ana García');
  });
});

// ─────────────────────────────────────────────────────────────
// POST /posts
// ─────────────────────────────────────────────────────────────
describe('POST /posts', () => {
  it('debe crear un post y retornar 201', async () => {
    const newPost = { id: 6, title: 'Nuevo Post', content: 'Contenido nuevo', author_id: 1, published: false, created_at: new Date() };
    pool.query.mockResolvedValueOnce({ rows: [newPost] });

    const res = await request(app)
      .post('/posts')
      .send({ title: 'Nuevo Post', content: 'Contenido nuevo', author_id: 1 });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id', 6);
  });

  it('debe retornar 400 si falta title', async () => {
    const res = await request(app)
      .post('/posts')
      .send({ content: 'Sin titulo', author_id: 1 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/title/i);
  });

  it('debe retornar 400 si falta content', async () => {
    const res = await request(app)
      .post('/posts')
      .send({ title: 'Sin contenido', author_id: 1 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/content/i);
  });

  it('debe retornar 400 si falta author_id', async () => {
    const res = await request(app)
      .post('/posts')
      .send({ title: 'Sin author', content: 'Contenido' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/author_id/i);
  });

  it('debe retornar 400 si el author_id no existe (error 23503)', async () => {
    const pgError = new Error('foreign key violation');
    pgError.code  = '23503';
    pool.query.mockRejectedValueOnce(pgError);

    const res = await request(app)
      .post('/posts')
      .send({ title: 'Post', content: 'Contenido', author_id: 9999 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/author_id/i);
  });
});

// ─────────────────────────────────────────────────────────────
// DELETE /posts/:id
// ─────────────────────────────────────────────────────────────
describe('DELETE /posts/:id', () => {
  it('debe eliminar un post existente y retornar 204', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1 });

    const res = await request(app).delete('/posts/1');
    expect(res.status).toBe(204);
  });

  it('debe retornar 404 si el post no existe', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 0 });

    const res = await request(app).delete('/posts/999');
    expect(res.status).toBe(404);
  });
});
