const express = require("express");
const router = express.Router({mergeParams: true});
const db = require("../models");

router.patch('/:s_id', function(req, res) {
  db.Stage.findById(req.params.s_id)
    .then(function(stage) {
      stage.assets.push(req.body.assetId);
      return stage.save();
    })
    .then(function(finalStage) {
      res.status(200).send(finalStage);
    })
    .catch(function(err) {
      res.status(500).send(err);
    })
});

router.patch('/:s_id/change', function(req, res) {
  db.Stage.findById(req.params.s_id).populate('assets')
    .then(function(stage) {
      let removePrev = stage.assets.findIndex(val => {
        return val.id === req.body.assetId
      });
      stage.assets.splice(removePrev, 1);
      return stage.save();
    })
    .then(function(firstStage) {
      db.Stage.findById(req.body.next)
        .then(function(nextStage) {
            nextStage.assets.push(req.body.assetId);
            return nextStage.save();
        })
        .then(function(finalStage) {
          res.status(200).send(finalStage);
        })
    })
    .catch(function(err) {
      res.status(500).send(err);
    })
});

module.exports = router;
