const jwt = require('jsonwebtoken');
const db = require("../models");

function loginRequired(req, res, next){
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

function ensureCorrectUser(req, res, next){
  const authHeader = req.headers['authorization'];
  let param = null;
  if(authHeader) {
    let token = authHeader.split(" ")[1];
    let mappedModel = {
      c_id: db.Asset,
      a_id: db.Asset,
      t_id: db.Type
    }

    jwt.verify(token, process.env.SECRET_KEY, function (err, decoded) {
      if(req.params.u_id) {
        if(!err && decoded.mongoId === req.params.u_id) {
          next();
        } else {
          res.status(401).send({
            message: "Unauthorized"
          });
        }
      } else {
        if (req.params.c_id) {
          param = "c_id";
        } else if (req.params.a_id) {
          param = "a_id";
        } else if (req.params.t_id) {
          param = "t_id";
        }
        mappedModel[param].findById(req.params[param])
        .then(function(foundItem) {
          if(!err && decoded.mongoId === foundItem.createdBy.toString()) {
            next();
          } else {
            throw "Error"
          }
        })
        .catch(function() {
          res.status(401).send({
            message: "Unauthorized"
          })
        });
      }
    });
  }
}

module.exports = { 
  loginRequired, 
  ensureCorrectUser
};
