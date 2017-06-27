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
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

activitySchema.plugin(findOrCreate);
const Activity = mongoose.model('Activity', activitySchema);
module.exports = Activity;
