const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../models');
const ensureCorrectUser = require('./helpers').ensureCorrectUser;

router.get('/', (request, response) =>
  db.Type
    .find()
    .then(types => response.send(types))
    .catch(err => response.status(500).send(err))
);

router.post('/', (request, response) => {
  let newType = new db.Type(request.body);
  const authHeader = request.headers['authorization'];
  const token = authHeader.split(' ')[1];
  const payload = jwt.decode(token);
  newType.createdBy = payload.mongoId;
  return newType
    .save()
    .then(newType => response.send(newType))
    .catch(err => response.status(500).send(err));
});

router.patch('/:typeId', ensureCorrectUser, (request, response) =>
  db.Type
    .findByIdAndUpdate(request.params.typeId, request.body, { new: true })
    .then(updatedType => response.status(200).send(updatedType))
    .catch(err => response.status(500).send(err))
);

router.delete('/:typeId', ensureCorrectUser, (request, response) =>
  db.Type
    .findById(request.params.typeId)
    .then(foundType => foundType.remove())
    .then(() => response.sendStatus(200))
    .catch(err => response.status(500).send(err))
);

module.exports = router;
