const express = require('express');
const router = express.Router({ mergeParams: true });
const jwt = require('jsonwebtoken');
const db = require('../models');
const ensureCorrectUser = require('./helpers').ensureCorrectUser;

router.get('/', function(req, res) {
  db.Type
    .findById(req.params.t_id)
    .populate('assets')
    .then(function(type) {
      res.send(type);
    })
    .catch(function(err) {
      res.status(500).send(err);
    });
});

router.post('/', function(req, res) {
  let newAsset = new db.Asset(req.body);
  const authHeader = req.headers['authorization'];
  const token = authHeader.split(' ')[1];
  const payload = jwt.decode(token);
  newAsset.typeId = req.params.t_id;
  newAsset.createdBy = payload.mongoId;
  newAsset
    .save()
    .then(function() {
      res.status(200).send(newAsset);
    })
    .catch(function(err) {
      res.status(500).send(err);
    });
});

router.patch('/:a_id', ensureCorrectUser, function(req, res) {
  db.Asset
    .findByIdAndUpdate(req.params.a_id, req.body, { new: true })
    .then(function(updatedAsset) {
      res.status(200).send(updatedAsset);
    })
    .catch(function(err) {
      res.status(500).send(err);
    });
});

router.delete('/:a_id', ensureCorrectUser, function(req, res) {
  db.Asset
    .findById(req.params.a_id)
    .then(function(foundAsset) {
      return foundAsset.remove();
    })
    .then(function() {
      res.sendStatus(200);
    })
    .catch(function(err) {
      res.status(500).send(err);
    });
});

module.exports = router;
