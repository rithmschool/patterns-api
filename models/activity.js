const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
const activitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    stages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stage'
      }
    ],
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
  },
  { timestamps: true }
);

activitySchema.pre('save', function(next) {
  let activity = this;
  if (activity.isNew) {
    return mongoose
      .model('User')
      .findById(activity.createdBy)
      .then(user => {
        user.activities.push(activity.id);
        return user.save();
      })
      .then(() => next())
      .catch(error => next(error));
  }
  return next();
});

activitySchema.plugin(findOrCreate);
const Activity = mongoose.model('Activity', activitySchema);
module.exports = Activity;
