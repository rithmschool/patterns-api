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
  activities: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Activity'
  }]
});

userSchema.post('save', function(user, next) {
  let type = null;
  let activity = null;
  let stages = null;
  if (user.isNew) {
    mongoose.model('Type').findOne({name: "Company"})
    .then(function(foundType){
      if (foundType) {
        return foundType;
      } else {
        return mongoose.model('Type').create({
          isAgent: true,
          name: "Company",
          createdBy: user.id
        });
      }
    })
    .then(function(foundType){
      type = foundType;
      return mongoose.model('Activity').create({
        name: "Job Search",
        createdBy: user.id,
        rootAssetType: type.id
      });
    })
    .then(function(newActivity){
      activity = newActivity;
      return mongoose.model('Stage').create([
        {
          name: "Research",
          activity: activity.id,
          createdBy: user.id
        },{
          name: "Apply",
          activity: activity.id,
          createdBy: user.id
        },{
          name: "Follow Up",
          activity: activity.id,
          createdBy: user.id
        }
      ]);
    })
    .then(function(stages){
      activity.stages.push(...stages);
      return activity.save();
    })
    .then(function(activity){
      user.activities.push(activity); 
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
})

userSchema.plugin(findOrCreate);
var User = mongoose.model('User', userSchema);
module.exports = User;
