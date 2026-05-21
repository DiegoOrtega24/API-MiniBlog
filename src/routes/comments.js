// src/routes/comments.js
// Rutas para /comments (Extra credit).

const express = require('express');
const router  = express.Router();
const svc     = require('../services/commentsService');

// ── GET /comments?post_id=X ───────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const comments = await svc.getComments(req.query.post_id || null);
    res.json(comments);
  } catch (err) { next(err); }
});

// ── GET /comments/:id ─────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const comment = await svc.getCommentById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comentario no encontrado' });
    res.json(comment);
  } catch (err) { next(err); }
});

// ── POST /comments ────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const { body, post_id, author_id } = req.body;

    if (!body     || !body.trim()) return res.status(400).json({ error: 'El campo body es obligatorio' });
    if (!post_id)                  return res.status(400).json({ error: 'El campo post_id es obligatorio' });
    if (!author_id)                return res.status(400).json({ error: 'El campo author_id es obligatorio' });

    const comment = await svc.createComment({ body: body.trim(), post_id, author_id });
    res.status(201).json(comment);
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ error: 'post_id o author_id no existen' });
    next(err);
  }
});

// ── DELETE /comments/:id ──────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await svc.deleteComment(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Comentario no encontrado' });
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
