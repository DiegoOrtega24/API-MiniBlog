// tests/comments.test.js
require('./setup');

const request = require('supertest');
const app     = require('../src/app');
const pool    = require('../src/db/pool');

describe('GET /comments', () => {
  it('debe retornar lista de comentarios con 200', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        { id: 1, body: 'Muy buen post', post_id: 1, author_id: 2, created_at: new Date(),
          author: { id: 2, name: 'Carlos Ruiz', email: 'carlos@example.com' } },
      ],
    });

    const res = await request(app).get('/comments');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('author');
  });
});

describe('POST /comments', () => {
  it('debe crear un comentario y retornar 201', async () => {
    const newComment = { id: 5, body: 'Interesante!', post_id: 1, author_id: 2, created_at: new Date() };
    pool.query.mockResolvedValueOnce({ rows: [newComment] });

    const res = await request(app)
      .post('/comments')
      .send({ body: 'Interesante!', post_id: 1, author_id: 2 });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id', 5);
  });

  it('debe retornar 400 si falta body', async () => {
    const res = await request(app)
      .post('/comments')
      .send({ post_id: 1, author_id: 2 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/body/i);
  });
});

describe('DELETE /comments/:id', () => {
  it('debe eliminar un comentario existente con 204', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1 });

    const res = await request(app).delete('/comments/1');
    expect(res.status).toBe(204);
  });

  it('debe retornar 404 si el comentario no existe', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 0 });

    const res = await request(app).delete('/comments/999');
    expect(res.status).toBe(404);
  });
});
