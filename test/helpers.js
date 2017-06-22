const jwt = require('jsonwebtoken');

function login(user){
  return jwt.sign(user, process.env.SECRET_KEY)
}

module.exports = login;
