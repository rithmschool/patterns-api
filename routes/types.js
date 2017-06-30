const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require("../models");
const ensureCorrectUser = require('./helpers').ensureCorrectUser;

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
  let newType = new db.Type(req.body)
  const authHeader = req.headers['authorization'];
  if(authHeader) {
    let token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.SECRET_KEY, function (err, decoded) {
      newType.createdBy = decoded.mongoId;
    });
  }
  newType.save()
    .then(function(newType) {
      res.send(newType);
    })
    .catch(function(err) {
      res.status(500).send(err);
    });
});

router.patch('/:t_id', ensureCorrectUser, function(req, res) {
  db.Type.findByIdAndUpdate(req.params.t_id, req.body, {new: true})
  .then(function(updatedType) {
    res.status(200).send(updatedType);
  })
  .catch(function(err){
    res.status(500).send(err);
  });
});

router.delete('/:t_id', ensureCorrectUser, function(req, res) {
  db.Type.findById(req.params.t_id)
  .then(function(foundType) {
    return foundType.remove();
  })
  .then(function(){
    res.sendStatus(200);
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
  const authHeader = req.headers['authorization'];
  if(authHeader) {
    let token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.SECRET_KEY, function (err, decoded) {
      newAsset.createdBy = decoded.mongoId;
    });
  }
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

router.patch('/:t_id/assets/:a_id', ensureCorrectUser, function(req, res) {
  db.Asset.findByIdAndUpdate(req.params.a_id, req.body, {new: true})
  .then(function(updatedAsset) {
    res.status(200).send(updatedAsset);
  })
  .catch(function(err){
    res.status(500).send(err);
  });
});

router.delete('/:t_id/assets/:a_id', ensureCorrectUser, function(req, res) {
  db.Asset.findById(req.params.a_id)
  .then(function(foundAsset){
    return foundAsset.remove();
  })
  .then(function(){
    res.sendStatus(200);
  })
  .catch(function(err){
    res.status(500).send(err);
  });
});

module.exports = router;
