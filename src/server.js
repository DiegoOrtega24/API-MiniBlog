// src/server.js
// Punto de entrada: levanta el servidor HTTP.
// Separado de app.js para facilitar los tests (supertest no necesita el puerto).

const app  = require('./app');
const pool = require('./db/pool');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // Verificar conexión a la base de datos antes de escuchar
    await pool.query('SELECT 1');
    console.log('✅ Conexión a PostgreSQL establecida');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
      console.log(`📄 Documentación: http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error('❌ No se pudo conectar a PostgreSQL:', err.message);
    process.exit(1);
  }
}

start();
