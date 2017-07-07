const mongoose = require("mongoose");
const findOrCreate = require('mongoose-findorcreate');
const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  url: String,
  logo: String,
  assets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  }],
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

assetSchema.pre('save', function(next) {
  let asset = this;
  if (asset.isNew) {
    mongoose.model('Type').findById(asset.typeId)
    .then(function(type) {
      type.assets.push(asset.id);
      return type.save();
    })
    .then(function(type) {
      return mongoose.model('Asset').findById(asset.parent);
    })
    .then(function(parent) {
      if (parent) {
        parent.assets.push(asset.id);
        return parent.save();
      }
    })
    .then(function() {
      next();
    })
    .catch(function(err) {
      next(err);
    })
  }
});

assetSchema.pre('remove', function(next) {
  let asset = this;
  mongoose.model('Asset').find({parent: asset.id})
  .then(function(childAssets) {
    // remove all child assets
    return Promise.all(childAssets.map(function(child) {
      return child.remove();
    }))
  })
  .then(function(){
    // remove asset from parent, if it has a parent
    return mongoose.model('Asset').findById(asset.parent);
  })
  .then(function(foundParent){
    if(foundParent){
      let foundIdx = foundParent.assets.indexOf(asset.id);
      foundParent.assets.splice(foundIdx, 1);
      return foundParent.save();
    }
  })
  .then(function() {
    // remove asset from array of assets of same type
    return mongoose.model('Type').findOne({id: asset.typeId});
  })
  .then(function(type) {
    if (type) {
      let foundIdx = type.assets.indexOf(asset.id);
      type.assets.splice(foundIdx, 1);
      return type.save();
    }
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
