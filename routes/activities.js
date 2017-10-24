const express = require('express');
const router = express.Router({ mergeParams: true });
const jwt = require('jsonwebtoken');
const db = require('../models');
const ensureCorrectUser = require('./helpers').ensureCorrectUser;

router.get('/', (request, response) => {
  db.Activity
    .find({ createdBy: request.params.userId })
    .populate({
      path: 'stages',
      model: 'Stage',
      populate: {
        path: 'assets',
        model: 'Asset'
      }
    })
    .then(activities => response.send(activities))
    .catch(err => response.status(500).send(err));
});

router.get('/:activityId', (request, response) => {
  db.Activity
    .findById(request.params.activityId)
    .populate({
      path: 'stages',
      populate: {
        path: 'assets'
      }
    })
    .then(activity => response.send(activity))
    .catch(err => response.status(500).send(err));
});

router.patch('/:activityId', (request, response) => {
  db.Activity
    .findByIdAndUpdate(
      request.params.activityId,
      { $set: request.body },
      { new: true }
    )
    .populate({
      path: 'stages',
      populate: {
        path: 'assets'
      }
    })
    .then(activity => response.send(activity))
    .catch(err => response.status(500).send(err));
});

// router.patch('/:stageId', (request, response, next) => {
//   db.Stage
//     .findByIdAndUpdate(request.params.stageId, request.body, { new: true })
//     .populate('assets')
//     .then(stage => {
//       db.Activity
//         .findByIdAndUpdate(stage.activity, { $set: { updatedAt: new Date() } })
//         .then(() => response.status(200).send(stage))
//         .catch(error => next(error));
//     })
//     .catch(err => response.status(500).send(err));
// });

router.post('/', ensureCorrectUser, (request, response, next) => {
  let newActivity = new db.Activity(request.body);
  const authHeader = request.headers['authorization'];
  const token = authHeader.split(' ')[1];
  const payload = jwt.decode(token);
  newActivity.createdBy = payload.mongoId;
  newActivity
    .save()
    .then(savedActivity => response.send(savedActivity))
    .catch(err => response.status(500).send(err));
});

module.exports = router;
