const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
const stageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    activity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity',
      required: true
    },
    assets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asset'
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

stageSchema.pre('save', function(next) {
  const stage = this;
  if (stage.isNew) {
    return mongoose
      .model('Activity')
      .findById(stage.activity)
      .then(activity => {
        activity.stages.push(stage.id);
        return activity.save();
      })
      .then(() => next())
      .catch(error => next(error));
  }
  return next();
});

stageSchema.plugin(findOrCreate);
const Stage = mongoose.model('Stage', stageSchema);
module.exports = Stage;
