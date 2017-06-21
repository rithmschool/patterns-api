var mongoose = require("mongoose");
var findOrCreate = require('mongoose-findorcreate');
var assetSchema = new mongoose.Schema({
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

var Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset;
