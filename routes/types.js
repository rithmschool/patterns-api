var express = require("express");
var router = express.Router();
var db = require("../models");

router.get('/', function(req, res) {
  db.Type.find()
    .then(function(types) {
      res.send(types);
    })
    .catch(function(err) {
      res.status(500).send(err);
    });
});

router.get('/:id/assets', function(req, res) {
  db.Type.findById(req.params.id).populate('assets')
  .then(function(type){
    res.send(type);
  })
  .catch(function(err){
    res.status(500).send(err);
  });
});

router.post('/:id/assets', function(req, res) {
  var newAsset = new db.Asset(req.body);
  var type;
  newAsset.typeId = req.params.id;
  db.Type.findById(req.params.id)
    .then(function(foundType) {
      type = foundType;
      return newAsset.save();
    })
    .then(function(createdAsset) {
      type.assets.push(createdAsset._id);
      return type.save();
    })
    .then(function() {
      res.send(newAsset);
    })
    .catch(function(err){
      res.status(500).send(err);
    });
});

module.exports = router;
