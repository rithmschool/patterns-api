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
  if(authHeader) {
    let token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.SECRET_KEY, function (err, decoded) {
      if(req.params.u_id) {
        if(!err && decoded.mongoId === req.params.u_id) {
          next();
        } else {
          res.status(401).send({
            message: "Unauthorized"
          });
        }
      } else if(req.params.c_id) {
        db.Asset.findById(req.params.c_id)
        .then(function(foundAsset) {
          if(!err && decoded.mongoId === foundAsset.createdBy.toString()) {
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
      } else if (req.params.a_id) {
        db.Asset.findById(req.params.a_id)
        .then(function(foundAsset) {
          if(!err && decoded.mongoId === foundAsset.createdBy.toString()) {
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
      } else if (req.params.t_id) {
        db.Type.findById(req.params.t_id)
        .then(function(foundType) {
          if(!err && decoded.mongoId === foundType.createdBy.toString()) {
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
