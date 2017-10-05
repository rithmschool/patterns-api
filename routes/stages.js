const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../models');

router.post('', (request, response, next) => {
  const newStage = new db.Stage(request.body);
  const token = request.headers['authorization'].split(' ')[1];
  const paylod = jwt.decode(token);
  newStage.createdBy = payload.mongoId;
  newStage
    .save()
    .then(saved => response.send(saved))
    .catch(err => response.status(500).send(err));
});

router.patch('/:stageId', (request, response, next) => {
  db.Stage
    .findByIdAndUpdate(request.params.stageId, request.body, { new: true })
    .populate('assets')
    .then(stage => response.status(200).send(stage))
    .catch(err => response.status(500).send(err));
});

module.exports = router;
