// ============================================================
// middleware/errorMiddleware.js
// Handlers 404 et erreur globale.
// ============================================================

function notFound(req, res, next) {
  const err  = new Error(`Route introuvable : ${req.method} ${req.originalUrl}`);
  err.status = 404;
  next(err);
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const statusCode = err.status || err.statusCode || 500;

  console.error(`[${new Date().toISOString()}] ${statusCode} — ${err.message}`);
  if (statusCode === 500) console.error(err.stack);

  const body = { error: err.message || "Erreur serveur interne." };
  if (process.env.NODE_ENV !== "production") body.stack = err.stack;

  res.status(statusCode).json(body);
}

module.exports = { notFound, errorHandler };
