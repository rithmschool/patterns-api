var express = require("express");
var router = express.Router({mergeParams: true});
var db = require("../models");

router.get('/', function(req, res) {
  console.log("REQ PARAMS", req.params.u_id)
  db.User.findById(req.params.u_id).populate('activities')
    .then(function(user){
      db.Activity.find(user.activities).populate('stages')
      .then(function(activity){
      res.send(activity);
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
