const express = require("express");
const router = express.Router();
const db = require("../models");

router.get('/', function(req, res) {
  db.Type.find()
    .then(function(types) {
      res.send(types);
    })
    .catch(function(err) {
      res.status(500).send(err);
    });
});

router.post('/', function(req, res) {
  db.Type.create(req.body)
    .then(function(newType) {
      res.send(newType);
    })
    .catch(function(err) {
      res.status(500).send(err);
    });
});

router.delete('/:t_id', function(req, res) {
  db.Type.findById(req.params.t_id)
  .then(function(foundType) {
    foundType.remove();
  })
  .then(function(){
    res.send(200);
  })
  .catch(function(err){
    res.status(500).send(err);
  });
})

router.get('/:t_id/assets', function(req, res) {
  db.Type.findById(req.params.t_id).populate('assets')
  .then(function(type){
    res.send(type);
  })
  .catch(function(err){
    res.status(500).send(err);
  });
});

router.post('/:t_id/assets', function(req, res) {
  let newAsset = new db.Asset(req.body);
  let type = null;
  newAsset.typeId = req.params.t_id;
  db.Type.findById(req.params.t_id)
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

router.delete('/:t_id/assets/:a_id', function(req, res) {
  db.Asset.findById(req.params.a_id)
  .then(function(foundAsset){
    foundAsset.remove();
  })
  .then(function(){
    res.send(200);
  })
  .catch(function(err){
    res.status(500).send(err);
  });
});

module.exports = router;
