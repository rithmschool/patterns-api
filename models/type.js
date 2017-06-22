const mongoose = require("mongoose");
const findOrCreate = require('mongoose-findorcreate');
const typeSchema = new mongoose.Schema({
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
const Type = mongoose.model('Type', typeSchema);
module.exports = Type;
