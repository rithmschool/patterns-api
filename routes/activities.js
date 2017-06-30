const express = require("express");
const router = express.Router({mergeParams: true});
const jwt = require('jsonwebtoken');
const db = require("../models");
const ensureCorrectUser = require('./helpers').ensureCorrectUser;

router.get('/', function(req, res) {
  db.Activity.find({createdBy: req.params.u_id}).populate('stages')
  .then(function(activities){
    res.send(activities);
  })
  .catch(function(err){
    res.status(500).send(err);
  });
});

router.get('/:a_id', function(req, res) {
  db.Activity.findById(req.params.a_id).populate({
    path:'stages',
    populate: {
      path: 'assets'
    } 
  })
  .then(function(activity){
    res.send(activity);
  })
  .catch(function(err){
    res.status(500).send(err);
  });
});

router.post('/', ensureCorrectUser, function(req, res, next) {
  let newActivity = new db.Activity(req.body);
  const authHeader = req.headers['authorization'];
  const token = authHeader.split(" ")[1];
  const payload = jwt.decode(token);
  newActivity.createdBy = payload.mongoId;
  newActivity.save().then(function() {
    res.send(newActivity);
  })
  .catch(function(err){
    res.status(500).send(err);
  });
});

module.exports = router;
