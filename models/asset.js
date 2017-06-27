const mongoose = require("mongoose");
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
    ref: 'Type'
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset'
  }
});

assetSchema.pre('remove', function(next) {
  let target = this;
  let parent = null;
  db.Asset.remove({parent: target.id})
  .then(function(){
    return db.Asset.findById(target.parent);
  })
  .then(function(foundParent){
    parent = foundParent;
    let foundIdx = parent.assets.indexOf(target.id);
    parent.assets.splice(foundIdx, 1);
    return parent.save();
  })
  .then(function(){
    next();
  })
  .catch(function(err){
    console.log("ERR", err)
    next(err);
  });
});

assetSchema.plugin(findOrCreate);
const Asset = mongoose.model('Asset', assetSchema);
module.exports = Asset;
