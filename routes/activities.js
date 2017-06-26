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
  db.Stage.findById(req.params.a_id).populate('stages')
  .then(function(stages){
    res.send(stages);
  })
  .catch(function(err){
    res.status(500).send(err);
  });
});

module.exports = router;