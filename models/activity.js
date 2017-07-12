const mongoose = require("mongoose");
const findOrCreate = require('mongoose-findorcreate');
const activitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date, 
    default: Date.now
  },
  updatedAt: {
    type: Date, 
    default: Date.now
  },
  stages: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Stage'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }, 
  rootAssetType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Type',
    required: true
  }
});

activitySchema.pre('save', function(next) {
  let activity = this;
  if (activity.isNew) {
    mongoose.model('User').findById(activity.createdBy)
    .then(function(user) {
      user.activities.push(activity.id);
      return user.save();
    })
    .then(function() {
      next();
    })
    .catch(function(error) {
      next(error);
    });
  } else {
    next();
  }
});

activitySchema.plugin(findOrCreate);
const Activity = mongoose.model('Activity', activitySchema);
module.exports = Activity;
