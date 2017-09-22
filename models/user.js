const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  firstName: String,
  lastName: String,
  picture: String,
  activities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity'
    }
  ]
});

userSchema.pre('save', function(next) {
  this.wasNew = this.isNew;
  return next();
});

userSchema.post('save', (user, next) => {
  let type = null;
  let activity = null;
  let stages = null;
  if (user.wasNew) {
    return mongoose
      .model('Type')
      .findOne({ name: 'Company' })
      .then(foundType => {
        if (foundType) {
          return foundType;
        }
        return mongoose.model('Type').create({
          isAgent: true,
          name: 'Company',
          createdBy: user.id
        });
      })
      .then(foundType => {
        type = foundType;
        return mongoose.model('Activity').create({
          name: 'Job Search',
          createdBy: user.id,
          rootAssetType: type.id
        });
      })
      .then(newActivity => {
        activity = newActivity;
        return mongoose.model('Stage').create({
          name: 'Research',
          activity: activity.id,
          createdBy: user.id
        });
      })
      .then(() =>
        mongoose.model('Stage').create({
          name: 'Apply',
          activity: activity.id,
          createdBy: user.id
        })
      )
      .then(() =>
        mongoose.model('Stage').create({
          name: 'Follow Up',
          activity: activity.id,
          createdBy: user.id
        })
      )
      .then(() => user.activities.push(activity))
      .then(() => next())
      .catch(error => next(error));
  }
  return next();
});

userSchema.plugin(findOrCreate);
const User = mongoose.model('User', userSchema);
module.exports = User;
