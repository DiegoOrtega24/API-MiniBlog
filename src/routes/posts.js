// src/routes/posts.js
// IMPORTANTE: la ruta /author/:authorId debe declararse ANTES de /:id
// para que Express no la interprete como un post con id="author".

const express = require('express');
const router  = express.Router();
const svc     = require('../services/postsService');

// ── GET /posts ────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const posts = await svc.getAllPosts();
    res.json(posts);
  } catch (err) { next(err); }
});

// ── GET /posts/author/:authorId ───────────────────────────────
// Debe ir antes de GET /posts/:id
router.get('/author/:authorId', async (req, res, next) => {
  try {
    const posts = await svc.getPostsByAuthor(req.params.authorId);
    res.json(posts);
  } catch (err) { next(err); }
});

// ── GET /posts/:id ────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const post = await svc.getPostById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post no encontrado' });
    res.json(post);
  } catch (err) { next(err); }
});

// ── POST /posts ───────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const { title, content, author_id, published } = req.body;

    if (!title   || !title.trim())   return res.status(400).json({ error: 'El campo title es obligatorio' });
    if (!content || !content.trim()) return res.status(400).json({ error: 'El campo content es obligatorio' });
    if (!author_id)                  return res.status(400).json({ error: 'El campo author_id es obligatorio' });

    const post = await svc.createPost({ title: title.trim(), content: content.trim(), author_id, published });
    res.status(201).json(post);
  } catch (err) {
    // FK violation: author_id no existe
    if (err.code === '23503') return res.status(400).json({ error: 'El author_id no existe' });
    next(err);
  }
});

// ── PUT /posts/:id ────────────────────────────────────────────
router.put('/:id', async (req, res, next) => {
  try {
    const { title, content, author_id, published } = req.body;

    if (!title   || !title.trim())   return res.status(400).json({ error: 'El campo title es obligatorio' });
    if (!content || !content.trim()) return res.status(400).json({ error: 'El campo content es obligatorio' });
    if (!author_id)                  return res.status(400).json({ error: 'El campo author_id es obligatorio' });

    const post = await svc.updatePost(req.params.id, { title: title.trim(), content: content.trim(), author_id, published });
    if (!post) return res.status(404).json({ error: 'Post no encontrado' });
    res.json(post);
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ error: 'El author_id no existe' });
    next(err);
  }
});

// ── DELETE /posts/:id ─────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await svc.deletePost(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Post no encontrado' });
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
