const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require("../models");
const ensureCorrectUser = require('./helpers').ensureCorrectUser;

router.get('/', function(req, res) {
  db.Type.find()
    .then(function(types) {
      res.send(types);
    })
    .catch(function(err) {
      res.status(500).send(err);
    });
});

router.post('/', function(req, res) {
  let newType = new db.Type(req.body)
  const authHeader = req.headers['authorization'];
  const token = authHeader.split(" ")[1];
  const payload = jwt.decode(token);
  newType.createdBy = payload.mongoId;
  newType.save()
  .then(function(newType) {
    res.send(newType);
  })
  .catch(function(err) {
    res.status(500).send(err);
  });
});

router.patch('/:t_id', ensureCorrectUser, function(req, res) {
  db.Type.findByIdAndUpdate(req.params.t_id, req.body, {new: true})
  .then(function(updatedType) {
    res.status(200).send(updatedType);
  })
  .catch(function(err){
    res.status(500).send(err);
  });
});

router.delete('/:t_id', ensureCorrectUser, function(req, res) {
  db.Type.findById(req.params.t_id)
  .then(function(foundType) {
    return foundType.remove();
  })
  .then(function(){
    res.sendStatus(200);
  })
  .catch(function(err){
    res.status(500).send(err);
  });
})

module.exports = router;
