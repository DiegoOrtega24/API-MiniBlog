// src/services/postsService.js
// Toda la lógica de acceso a datos para la entidad posts.

const pool = require('../db/pool');

// ── GET /posts ────────────────────────────────────────────────
async function getAllPosts() {
  const { rows } = await pool.query(
    `SELECT p.id, p.title, p.content, p.author_id, p.published, p.created_at
     FROM posts p
     ORDER BY p.id`
  );
  return rows;
}

// ── GET /posts/:id ────────────────────────────────────────────
async function getPostById(id) {
  const { rows } = await pool.query(
    `SELECT id, title, content, author_id, published, created_at
     FROM posts WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

// ── GET /posts/author/:authorId  (post + detalle del author) ──
async function getPostsByAuthor(authorId) {
  const { rows } = await pool.query(
    `SELECT
       p.id, p.title, p.content, p.published, p.created_at,
       json_build_object(
         'id',    a.id,
         'name',  a.name,
         'email', a.email,
         'bio',   a.bio
       ) AS author
     FROM posts p
     JOIN authors a ON a.id = p.author_id
     WHERE p.author_id = $1
     ORDER BY p.id`,
    [authorId]
  );
  return rows;
}

// ── POST /posts ───────────────────────────────────────────────
async function createPost({ title, content, author_id, published }) {
  const { rows } = await pool.query(
    `INSERT INTO posts (title, content, author_id, published)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, content, author_id, published, created_at`,
    [title, content, author_id, published ?? false]
  );
  return rows[0];
}

// ── PUT /posts/:id ────────────────────────────────────────────
async function updatePost(id, { title, content, author_id, published }) {
  const { rows } = await pool.query(
    `UPDATE posts
     SET title = $1, content = $2, author_id = $3, published = $4
     WHERE id = $5
     RETURNING id, title, content, author_id, published, created_at`,
    [title, content, author_id, published ?? false, id]
  );
  return rows[0] || null;
}

// ── DELETE /posts/:id ─────────────────────────────────────────
async function deletePost(id) {
  const { rowCount } = await pool.query(
    'DELETE FROM posts WHERE id = $1',
    [id]
  );
  return rowCount > 0;
}

module.exports = { getAllPosts, getPostById, getPostsByAuthor, createPost, updatePost, deletePost };
