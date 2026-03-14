// ============================================================
// middleware/loggerMiddleware.js
// Logger HTTP simple (méthode, chemin, statut, durée).
// ============================================================

function logger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const ms      = Date.now() - start;
    const method  = req.method.padEnd(6);
    const status  = colorStatus(res.statusCode);
    const ts      = new Date().toISOString();
    console.log(`[${ts}] ${method} ${req.originalUrl} ${status} — ${ms}ms`);
  });

  next();
}

function colorStatus(s) {
  if (process.env.NODE_ENV === "production") return String(s);
  if (s >= 500) return `\x1b[31m${s}\x1b[0m`;
  if (s >= 400) return `\x1b[33m${s}\x1b[0m`;
  if (s >= 300) return `\x1b[36m${s}\x1b[0m`;
  return `\x1b[32m${s}\x1b[0m`;
}

module.exports = logger;
