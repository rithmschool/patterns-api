require('dotenv').load();
const jwt = require('jsonwebtoken');

exports.loginRequired = function(req, res, next){
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    let token = authHeader.split(" ")[1];
    try {
      jwt.verify(token, process.env.SECRET_KEY)
      next();
    } catch(e) {
      res.status(401).send({
        message: "You must be logged in to continue."
      });
    }
  } else {
    res.status(401).send({
      message: "You must be logged in to continue."
    });
  }
}

exports.ensureCorrectUser = function(req, res, next){
  const authHeader = req.headers['authorization'];
  if(authHeader) {
    let token = authHeader.split(" ")[1];
    try {
      jwt.verify(token, process.env.SECRET_KEY, function (err, decoded) {
        if(decoded.googleId === req.params.id) {
          // the token has googleId, firstName, lastName, and email
          // check what's in req.params
          next();
        } else {
          res.status(401).send({
            message: "Unauthorized"
          });
        }
      });
    } catch(e) {
      res.status(401).send({
        message: "Unauthorized"
      });
    }
  }
}
