const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Admin access only');
  }
};

module.exports = { protect, adminOnly };


module.exports = { errorHandler, protect, adminOnly };

const { protect, adminOnly } = require('../middleware/authMiddleware');

// Example: Protect a route
router.get('/admin', protect, adminOnly, (req, res) => {
  res.status(200).json({ message: 'Welcome Admin' });
});
