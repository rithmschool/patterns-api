const jwt = require('jsonwebtoken');
const db = require('../models');

function loginRequired(request, response, next) {
  const authHeader = request.headers['authorization'];
  if (authHeader) {
    let token = authHeader.split(' ')[1];
    try {
      jwt.verify(token, process.env.SECRET_KEY);
      return next();
    } catch (e) {
      return response.status(401).send({
        message: 'You must be logged in to continue.'
      });
    }
  } else {
    return response.status(401).send({
      message: 'You must be logged in to continue.'
    });
  }
}

function ensureCorrectUser(request, response, next) {
  const authHeader = request.headers['authorization'];
  let param = null;
  if (authHeader) {
    let token = authHeader.split(' ')[1];
    let mappedModel = {
      assetId: db.Asset,
      typeId: db.Type
    };

    return jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (request.params.userId) {
        if (!err && decoded.mongoId === request.params.userId) {
          return next();
        }
        return response.status(401).send({
          message: 'Unauthorized'
        });
      }
      if (request.params.assetId) {
        param = 'assetId';
      } else if (request.params.typeId) {
        param = 'typeId';
      }
      return mappedModel[param]
        .findById(request.params[param])
        .then(foundItem => {
          if (!err && decoded.mongoId === foundItem.createdBy.toString()) {
            return next();
          }
          throw 'Error';
        })
        .catch(() =>
          response.status(401).send({
            message: 'Unauthorized'
          })
        );
    });
  }
}

module.exports = {
  loginRequired,
  ensureCorrectUser
};
