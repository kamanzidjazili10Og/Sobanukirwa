const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Sobanukirwa@123';

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  const token = auth.split(' ')[1];
  if (!token || !token.startsWith('admin-session-')) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  next();
}

module.exports = { requireAuth };
