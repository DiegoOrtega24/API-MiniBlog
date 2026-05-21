// src/app.js
require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const YAML         = require('yamljs');
const swaggerUi    = require('swagger-ui-express');
const path         = require('path');

const authorsRouter  = require('./routes/authors');
const postsRouter    = require('./routes/posts');
const commentsRouter = require('./routes/comments');
const errorHandler   = require('./middlewares/errorHandler');

const app = express();

// ── Middlewares globales ──────────────────────────────────────
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "MiniBlog API running"
  });
});

// ── Documentación OpenAPI ─────────────────────────────────────
const swaggerDocument = YAML.load(path.join(__dirname, '..', 'docs', 'openapi.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ── Ruta de salud ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Rutas de la API ───────────────────────────────────────────
app.use('/authors',  authorsRouter);
app.use('/posts',    postsRouter);
app.use('/comments', commentsRouter);

// ── 404 para rutas no existentes ─────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.path} no encontrada` });
});

// ── Middleware global de errores (debe ir al final) ───────────
app.use(errorHandler);

module.exports = app;