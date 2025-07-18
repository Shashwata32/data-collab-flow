const jwt = require('jsonwebtoken');

function authenticate(token) {
  if (!token) {
    throw new Error('Not authenticated: No token provided.');
  }
  try {
    // jwt.verify will throw an error if the token is invalid or expired
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // Log the specific error for debugging, but return a generic message
    console.error('JWT Verification Error:', err.message);
    throw new Error('Authentication failed: Invalid token.');
  }
}

module.exports = { authenticate };
