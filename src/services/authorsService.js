// src/services/authorsService.js
// Toda la lógica de acceso a datos para la entidad authors.
// Las consultas están parametrizadas para prevenir SQL injection.

const pool = require('../db/pool');

// ── GET /authors ─────────────────────────────────────────────
async function getAllAuthors() {
  const { rows } = await pool.query(
    'SELECT id, name, email, bio, created_at FROM authors ORDER BY id'
  );
  return rows;
}

// ── GET /authors/:id ─────────────────────────────────────────
async function getAuthorById(id) {
  const { rows } = await pool.query(
    'SELECT id, name, email, bio, created_at FROM authors WHERE id = $1',
    [id]
  );
  return rows[0] || null;   // null → 404 en el controlador
}

// ── POST /authors ────────────────────────────────────────────
async function createAuthor({ name, email, bio }) {
  const { rows } = await pool.query(
    `INSERT INTO authors (name, email, bio)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, bio, created_at`,
    [name, email, bio || null]
  );
  return rows[0];
}

// ── PUT /authors/:id ──────────────────────────────────────────
async function updateAuthor(id, { name, email, bio }) {
  const { rows } = await pool.query(
    `UPDATE authors
     SET name = $1, email = $2, bio = $3
     WHERE id = $4
     RETURNING id, name, email, bio, created_at`,
    [name, email, bio ?? null, id]
  );
  return rows[0] || null;   // null → 404
}

// ── DELETE /authors/:id ───────────────────────────────────────
async function deleteAuthor(id) {
  const { rowCount } = await pool.query(
    'DELETE FROM authors WHERE id = $1',
    [id]
  );
  return rowCount > 0;      // false → 404
}

module.exports = { getAllAuthors, getAuthorById, createAuthor, updateAuthor, deleteAuthor };
