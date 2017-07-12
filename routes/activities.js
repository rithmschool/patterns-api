const express = require("express");
const router = express.Router({mergeParams: true});
const jwt = require('jsonwebtoken');
const db = require("../models");
const ensureCorrectUser = require('./helpers').ensureCorrectUser;

router.get('/', function(req, res) {
  db.User.findById(req.params.u_id).populate('activities')
    .then(function(user){
      db.Activity.find(user.activities).populate({
        path: 'stages',
        model: 'Stage',
        populate: {
          path: 'assets',
          model: 'Asset',
        }
      })
      .then(function(activities){
        res.send(activities);
      })
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

router.post('/', ensureCorrectUser, function(req, res) {
  let newActivity = new db.Activity(req.body);
  let user = null;
  const authHeader = req.headers['authorization'];
  const token = authHeader.split(" ")[1];
  const payload = jwt.decode(token);
  newActivity.createdBy = payload.mongoId;
  db.User.findById(req.params.u_id)
    .then(function(foundUser) {
      user = foundUser;
      return user.save();
    })
    .then(function(foundUser) {
      newActivity.user = foundUser;
      return newActivity.save();
    })
    .then(function(newActivity) {
      user.activities.push(newActivity.id);
      return user.save();
    })
    .then(function() {
      res.send(newActivity);
    })
    .catch(function(err){
      res.status(500).send(err);
    });
});

module.exports = router;
