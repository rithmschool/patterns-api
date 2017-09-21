const jwt = require('jsonwebtoken');

function login(user) {
  const payload = {
    googleId: user.googleId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    mongoId: user.id
  };
  return jwt.sign(payload, process.env.SECRET_KEY);
}

module.exports = { login };
