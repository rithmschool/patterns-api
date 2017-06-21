var mongoose = require("mongoose");
var findOrCreate = require('mongoose-findorcreate');
var typeSchema = new mongoose.Schema({
  isAgent: {
    type: Boolean,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  assets: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Asset'
  }]
});

typeSchema.plugin(findOrCreate);
var Type = mongoose.model('Type', typeSchema);

module.exports = Type;
