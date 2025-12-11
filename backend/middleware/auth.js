// middleware/auth.js
const { verify } = require('../utils/jwt');

module.exports = function requireAuth() {
  return (req, res, next) => {
    const auth = (req.headers.authorization || '').trim();
    if (!auth) {
      req.user = null;
      return next();
    }
    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      req.user = null; return next();
    }
    try {
      const payload = verify(parts[1]);
      req.user = { id: payload.id, role: payload.role };
      return next();
    } catch (err) {
      req.user = null;
      return next();
    }
  };
};
