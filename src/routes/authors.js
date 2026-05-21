// src/routes/authors.js
// Rutas para /authors. La validación vive aquí; la lógica SQL en el service.

const express = require('express');
const router  = express.Router();
const svc     = require('../services/authorsService');

// ── GET /authors ──────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const authors = await svc.getAllAuthors();
    res.json(authors);
  } catch (err) { next(err); }
});

// ── GET /authors/:id ──────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const author = await svc.getAuthorById(req.params.id);
    if (!author) return res.status(404).json({ error: 'Author no encontrado' });
    res.json(author);
  } catch (err) { next(err); }
});

// ── POST /authors ─────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const { name, email, bio } = req.body;

    if (!name || !name.trim())   return res.status(400).json({ error: 'El campo name es obligatorio' });
    if (!email || !email.trim()) return res.status(400).json({ error: 'El campo email es obligatorio' });

    const author = await svc.createAuthor({ name: name.trim(), email: email.trim(), bio });
    res.status(201).json(author);
  } catch (err) {
    // Código 23505 → violación de restricción UNIQUE (email duplicado)
    if (err.code === '23505') return res.status(400).json({ error: 'El email ya está registrado' });
    next(err);
  }
});

// ── PUT /authors/:id ──────────────────────────────────────────
router.put('/:id', async (req, res, next) => {
  try {
    const { name, email, bio } = req.body;

    if (!name || !name.trim())   return res.status(400).json({ error: 'El campo name es obligatorio' });
    if (!email || !email.trim()) return res.status(400).json({ error: 'El campo email es obligatorio' });

    const author = await svc.updateAuthor(req.params.id, { name: name.trim(), email: email.trim(), bio });
    if (!author) return res.status(404).json({ error: 'Author no encontrado' });
    res.json(author);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'El email ya está registrado' });
    next(err);
  }
});

// ── DELETE /authors/:id ───────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await svc.deleteAuthor(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Author no encontrado' });
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
