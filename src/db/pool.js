// src/db/pool.js
// Conexión centralizada a PostgreSQL usando pg.Pool
// Se reutiliza a lo largo de toda la aplicación.

require('dotenv').config();
const { Pool } = require('pg');

// Si existe DATABASE_URL (Railway) se usa directamente;
// si no, se construye desde variables individuales.
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      }
    : {
        host:     process.env.DB_HOST     || 'localhost',
        port:     parseInt(process.env.DB_PORT || '5432', 10),
        database: process.env.DB_NAME     || 'blog_db',
        user:     process.env.DB_USER     || 'postgres',
        password: process.env.DB_PASSWORD || '',
      }
);

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err.message);
});

module.exports = pool;
