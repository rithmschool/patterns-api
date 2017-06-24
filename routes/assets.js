var express = require("express");
var router = express.Router({mergeParams: true});
var db = require("../models");

router.get('/', function(req, res) {
  db.Asset.findById(req.params.a_id).populate('assets')
  .then(function(assets){
    res.send(assets);
  })
  .catch(function(err){
    res.status(500).send(err);
  });
});

module.exports = router;
