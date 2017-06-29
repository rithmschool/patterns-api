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
});

module.exports = router;
