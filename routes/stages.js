const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../models');

router.patch('/:stageId', function(request, response) {
  db.Stage
    .findByIdAndUpdate(request.params.stageId, request.body, { new: true })
    .populate('assets')
    .then(stage => response.status(200).send(stage))
    .catch(err => response.status(500).send(err));
});

module.exports = router;
