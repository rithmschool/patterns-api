const express = require("express");
const router = express.Router({mergeParams: true});
const db = require("../models");

router.patch('/:s_id', function(req, res) {
  db.Stage.findByIdAndUpdate(req.params.s_id, req.body, {new: true}).populate('assets')
    .then(function(stage) {
      res.status(200).send(stage);
    })
    .catch(function(err) {
      res.status(500).send(err);
    })
});

module.exports = router;
