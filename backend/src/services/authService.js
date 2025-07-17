const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';

function authenticate(token) {
  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    return user;
  } catch (err) {
    throw new Error('Invalid token');
  }
}

module.exports = { authenticate };
