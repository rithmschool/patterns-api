const mongoose = require("mongoose");
const findOrCreate = require('mongoose-findorcreate');
const Asset = require('./asset');
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
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

typeSchema.pre('remove', function(next) {
  let type = this;
  Asset.find({typeId: type.id})
  .then(function(foundAssets){
    return Promise.all(foundAssets.map(function(asset) {
      return asset.remove();
    }));
  })
  .then(function() {
    next();
  })
  .catch(function(err){
    next(err);
  });
});

typeSchema.plugin(findOrCreate);
const Type = mongoose.model('Type', typeSchema);
module.exports = Type;
