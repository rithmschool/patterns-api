const mongoose = require("mongoose");
// const Type = require("./type");
const findOrCreate = require('mongoose-findorcreate');
const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  url: String,
  logo: String,
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
    ref: 'Type',
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

assetSchema.pre('remove', function(next) {
  let target = this;
  Asset.find({parent: target.id})
  .then(function(childAssets) {
    // remove all child assets
    return Promise.all(childAssets.map(function(child) {
      return child.remove();
    }))
  })
  .then(function(){
    // remove target from parent, if it has a parent
    return Asset.findById(target.parent);
  })
  .then(function(foundParent){
    if(foundParent){
      let foundIdx = foundParent.assets.indexOf(target.id);
      foundParent.assets.splice(foundIdx, 1);
      return foundParent.save();
    }
  })
  .then(function() {
    // remove target from array of assets of same type
    return mongoose.model('Type').findById(target.typeId);
  })
  .then(function(type) {
    let foundIdx = type.assets.indexOf(target.id);
    type.assets.splice(foundIdx, 1);
    return type.save();
  })
  .then(function(){
    next();
  })
  .catch(function(err){
    next(err);
  });
});

assetSchema.plugin(findOrCreate);
const Asset = mongoose.model('Asset', assetSchema);
module.exports = Asset;
