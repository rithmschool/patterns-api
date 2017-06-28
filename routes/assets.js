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

router.post('/', function(req, res) {
  let newAsset = new db.Asset(req.body);
  let parent = null;
  db.Asset.findById(req.params.a_id)
    .then(function(parentAsset) {
      parent = parentAsset;
      return parent.save();
    })
    .then(function(parentAsset) {
      newAsset.parent = parentAsset;
      return newAsset.save();
    })
    .then(function(newAsset) {
      parent.assets.push(newAsset.id);
      return parent.save();
    })
    .then(function() {
      res.send(newAsset);
    })
    .catch(function(err){
      res.status(500).send(err);
    });
});

router.patch('/:c_id', function(req, res) {
  db.Asset.findByIdAndUpdate(req.params.c_id, req.body, {new: true})
  .then(function(updatedAsset) {
    res.status(200).send(updatedAsset);
  })
  .catch(function(err){
    res.status(500).send(err);
  });
});

router.delete('/:c_id', function(req, res) {
  db.Asset.findById(req.params.c_id)
  .then(function(target){
    target.remove();
  })
  .then(function() {
    res.status(200).send({});
  })
  .catch(function(err){
    res.status(500).send(err);
  });
});

module.exports = router;
