-- ============================================================
-- setup.sql - Script de inicialización de base de datos
-- Ejecutar: psql -U postgres -d blog_db -f setup.sql
-- ============================================================

-- Eliminar tablas si existen (orden inverso por FK)
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS authors CASCADE;

-- ============================================================
-- TABLA: authors
-- ============================================================
CREATE TABLE authors (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL,
  email      VARCHAR(150)  UNIQUE NOT NULL,
  bio        TEXT,
  created_at TIMESTAMPTZ   DEFAULT NOW()
);

-- ============================================================
-- TABLA: posts
-- ============================================================
CREATE TABLE posts (
  id         SERIAL PRIMARY KEY,
  title      VARCHAR(200)  NOT NULL,
  content    TEXT          NOT NULL,
  author_id  INTEGER       NOT NULL,
  published  BOOLEAN       DEFAULT FALSE,
  created_at TIMESTAMPTZ   DEFAULT NOW(),
  FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLA: comments  (Extra credit)
-- ============================================================
CREATE TABLE comments (
  id         SERIAL PRIMARY KEY,
  body       TEXT          NOT NULL,
  post_id    INTEGER       NOT NULL,
  author_id  INTEGER       NOT NULL,
  created_at TIMESTAMPTZ   DEFAULT NOW(),
  FOREIGN KEY (post_id)   REFERENCES posts(id)   ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
);

-- ============================================================
-- SEED: datos de ejemplo
-- ============================================================
INSERT INTO authors (name, email, bio) VALUES
  ('Ana García',   'ana@example.com',    'Desarrolladora full-stack apasionada por Node.js'),
  ('Carlos Ruiz',  'carlos@example.com', 'Escritor técnico especializado en bases de datos'),
  ('María López',  'maria@example.com',  'Ingeniera de software con foco en APIs REST');

INSERT INTO posts (title, content, author_id, published) VALUES
  ('Introducción a Node.js',       'Node.js es un runtime de JavaScript basado en el motor V8 de Chrome...', 1, true),
  ('PostgreSQL vs MySQL',          'Ambas bases de datos tienen ventajas y desventajas según el caso de uso...', 2, true),
  ('APIs RESTful',                 'REST es un estilo arquitectónico para diseñar servicios web...', 1, true),
  ('Manejo de errores en Express', 'El manejo apropiado de errores mejora la experiencia del usuario...', 3, false),
  ('Async/Await explicado',        'Las promesas simplifican el código asíncrono en JavaScript...', 1, false);

INSERT INTO comments (body, post_id, author_id) VALUES
  ('Excelente introducción, muy clara.',        1, 2),
  ('Me ayudó mucho para entender el tema.',     1, 3),
  ('Gran comparativa, gracias por el detalle.', 2, 1),
  ('Muy útil para mi proyecto.',                3, 2);

-- Verificar
SELECT 'authors' AS tabla, COUNT(*) AS filas FROM authors
UNION ALL
SELECT 'posts',    COUNT(*) FROM posts
UNION ALL
SELECT 'comments', COUNT(*) FROM comments;
