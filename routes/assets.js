const express = require('express');
const router = express.Router({ mergeParams: true });
const jwt = require('jsonwebtoken');
const db = require('../models');
const ensureCorrectUser = require('./helpers').ensureCorrectUser;

router.get('/', (request, response) => {
  db.Type
    .findById(request.params.typeId)
    .populate('assets')
    .then(type => response.send(type))
    .catch(err => response.status(500).send(err));
});

router.post('/', (request, response) => {
  let newAsset = new db.Asset(request.body);
  const authHeader = request.headers['authorization'];
  const token = authHeader.split(' ')[1];
  const payload = jwt.decode(token);
  newAsset.typeId = request.params.typeId;
  newAsset.createdBy = payload.mongoId;
  newAsset
    .save()
    .then(function() {
      response.status(200).send(newAsset);
    })
    .catch(function(err) {
      response.status(500).send(err);
    });
});

router.patch('/:assetId', ensureCorrectUser, (request, response) => {
  db.Asset
    .findByIdAndUpdate(request.params.assetId, request.body, { new: true })
    .then(updatedAsset => response.status(200).send(updatedAsset))
    .catch(err => response.status(500).send(err));
});

router.delete('/:assetId', ensureCorrectUser, (request, response) => {
  db.Asset
    .findById(request.params.assetId)
    .then(foundAsset => foundAsset.remove())
    .then(() => response.sendStatus(200))
    .catch(err => response.status(500).send(err));
});

module.exports = router;
