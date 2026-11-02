const responseTimeLogger = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.once('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const route = req.route?.path
      ? `${req.baseUrl || ''}${req.route.path}`
      : req.originalUrl;

    console.log(
      `${req.method} ${route} ${res.statusCode} ${durationMs.toFixed(2)} ms`
    );
  });

  next();
};

module.exports = responseTimeLogger;
