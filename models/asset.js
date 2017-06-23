const mongoose = require("mongoose");
const findOrCreate = require('mongoose-findorcreate');
const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  assets: [this],
  createdAt: {
    type: Date, 
    default: Date.now
  },
  updatedAt: {
    type: Date, 
    default: Date.now
  },
  typeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Type'
  }
});

assetSchema.plugin(findOrCreate);
const Asset = mongoose.model('Asset', assetSchema);
module.exports = Asset;
