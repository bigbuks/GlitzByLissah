import jwt from 'jsonwebtoken';

// ==========================================
// AUTH MIDDLEWARE — Any logged-in user
// ==========================================
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided. Please login.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Auth error:', error);
    res.status(401).json({ message: 'Invalid token. Please login again.' });
  }
};

// ==========================================
// ADMIN MIDDLEWARE — Only admins
// ==========================================
const admin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided. Please login.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    next();
  } catch (error) {
    console.error('❌ Admin auth error:', error);
    res.status(401).json({ message: 'Invalid token. Please login again.' });
  }
};

export { auth as default, admin };