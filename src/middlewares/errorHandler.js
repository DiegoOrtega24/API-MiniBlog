// src/middlewares/errorHandler.js
// Middleware global de manejo de errores.
// Debe registrarse ÚLTIMO en app.js (después de todas las rutas).

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error('[ERROR]', err.message);

  // Error de sintaxis en JSON del body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido en el cuerpo de la solicitud' });
  }

  // Error genérico de PostgreSQL no manejado en la ruta
  if (err.code) {
    return res.status(500).json({ error: 'Error de base de datos', detail: err.message });
  }

  res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = errorHandler;
