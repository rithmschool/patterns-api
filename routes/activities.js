var express = require("express");
var router = express.Router({mergeParams: true});
var db = require("../models");

router.get('/', function(req, res) {
  db.User.findById(req.params.u_id).populate('activities')
    .then(function(user){
      db.Activity.find(user.activities).populate('stages')
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

router.post('/', function(req, res) {
  let newActivity = new db.Activity(req.body);
  let user = null;
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
