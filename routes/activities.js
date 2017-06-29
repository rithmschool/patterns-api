let express = require("express");
let router = express.Router({mergeParams: true});
const jwt = require('jsonwebtoken');
let db = require("../models");
let ensureCorrectUser = require('./helpers').ensureCorrectUser_Activities;

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

router.post('/', ensureCorrectUser, function(req, res) {
  console.log("UP HERE")
  let newActivity = new db.Activity(req.body);
  let user = null;
  const authHeader = req.headers['authorization'];
  if(authHeader) {
    let token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.SECRET_KEY, function (err, decoded) {
      newActivity.createdBy = decoded.mongoId;
    });
  }
  db.User.findById(req.params.u_id)
    .then(function(foundUser) {
      user = foundUser;
      return user.save();
    })
    .then(function(foundUser) {
      newActivity.user = foundUser;
      console.log("NEW",newActivity);
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
