// src/services/commentsService.js
// Servicio para la entidad comments (Extra credit).

const pool = require('../db/pool');

// ── GET /comments?post_id=X ───────────────────────────────────
async function getComments(postId) {
  const query = postId
    ? `SELECT c.id, c.body, c.post_id, c.author_id, c.created_at,
              json_build_object('id', a.id, 'name', a.name, 'email', a.email) AS author
       FROM comments c
       JOIN authors a ON a.id = c.author_id
       WHERE c.post_id = $1
       ORDER BY c.id`
    : `SELECT c.id, c.body, c.post_id, c.author_id, c.created_at,
              json_build_object('id', a.id, 'name', a.name, 'email', a.email) AS author
       FROM comments c
       JOIN authors a ON a.id = c.author_id
       ORDER BY c.id`;

  const { rows } = postId
    ? await pool.query(query, [postId])
    : await pool.query(query);
  return rows;
}

// ── GET /comments/:id ─────────────────────────────────────────
async function getCommentById(id) {
  const { rows } = await pool.query(
    `SELECT c.id, c.body, c.post_id, c.author_id, c.created_at,
            json_build_object('id', a.id, 'name', a.name, 'email', a.email) AS author
     FROM comments c
     JOIN authors a ON a.id = c.author_id
     WHERE c.id = $1`,
    [id]
  );
  return rows[0] || null;
}

// ── POST /comments ────────────────────────────────────────────
async function createComment({ body, post_id, author_id }) {
  const { rows } = await pool.query(
    `INSERT INTO comments (body, post_id, author_id)
     VALUES ($1, $2, $3)
     RETURNING id, body, post_id, author_id, created_at`,
    [body, post_id, author_id]
  );
  return rows[0];
}

// ── DELETE /comments/:id ──────────────────────────────────────
async function deleteComment(id) {
  const { rowCount } = await pool.query(
    'DELETE FROM comments WHERE id = $1',
    [id]
  );
  return rowCount > 0;
}

module.exports = { getComments, getCommentById, createComment, deleteComment };
