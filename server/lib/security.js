import jwt from "jsonwebtoken";
export function verifyToken(token, secret) {
  if (typeof token !== "string" || token.length > 2048)
    throw new Error("Unauthorized");
  const payload = jwt.verify(token, secret, { algorithms: ["HS256"] });
  if (
    typeof payload !== "object" ||
    typeof payload.id !== "string" ||
    !/^[a-f0-9]{24}$/i.test(payload.id) ||
    !Number.isFinite(payload.exp)
  )
    throw new Error("Unauthorized");
  return payload;
}
export function authenticate(secret) {
  return (req, res, next) => {
    try {
      req.auth = verifyToken(
        req.headers.authorization?.replace(/^Bearer /, ""),
        secret,
      );
      next();
    } catch {
      res.status(401).json({
        msg: "Please sign in again.",
        output: "Please sign in again.",
      });
    }
  };
}
// A bounded, per-process limiter. Multi-instance deployments need a shared edge/store limiter.
export function createLimiter({
  limit = 20,
  windowMs = 900000,
  maxKeys = 10000,
  now = Date.now,
} = {}) {
  const entries = new Map();
  return (key) => {
    const time = now();
    let entry = entries.get(key);
    if (!entry || entry.until <= time) {
      if (entries.size >= maxKeys) {
        for (const [id, item] of entries)
          if (item.until <= time) entries.delete(id);
      }
      if (!entries.has(key) && entries.size >= maxKeys) return false;
      entry = { count: 0, until: time + windowMs };
      entries.set(key, entry);
    }
    return ++entry.count <= limit;
  };
}
export function rateLimit(options) {
  const allow = createLimiter(options);
  return (req, res, next) => {
    if (allow(req.auth?.id || req.ip)) return next();
    res.setHeader(
      "Retry-After",
      String(Math.ceil((options?.windowMs || 900000) / 1000)),
    );
    res.status(429).json({
      msg: "Too many requests. Please try again later.",
      output: "Too many requests. Please try again later.",
    });
  };
}
