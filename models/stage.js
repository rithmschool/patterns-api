const mongoose = require("mongoose");
const findOrCreate = require('mongoose-findorcreate');
const stageSchema = new mongoose.Schema({
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
  activity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  },
  assets: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Asset'
  }]
});

stageSchema.plugin(findOrCreate);
const Stage = mongoose.model('Stage', stageSchema);
module.exports = Stage;
