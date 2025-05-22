/**
 * Middleware to allow only admin users to access a route.
 * Assumes req.user is set by authentication middleware.
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ error: "Access denied. Admins only." });
};

export default adminOnly;
