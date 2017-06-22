const jwt = require('jsonwebtoken');

function loginRequired(req, res, next){
  const authHeader = req.headers['authorization'];
  if (authHeader && jwt.decode(authHeader.split(" ")[1], process.env.SECRET_KEY)) {
    next();
  } else {
    res.status(401).send({
      message: "You must be logged in to continue."
    });
  }
}

module.exports = loginRequired;
