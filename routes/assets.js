var express = require("express");
var router = express.Router({mergeParams: true});
var db = require("../models");

router.get('/', function(req, res) {
  db.Type.findById(req.params.id).populate('assets')
  .then(function(type){
    res.send(type);
  })
  .catch(function(err){
    res.send(err);
  })
});

module.exports = router;
