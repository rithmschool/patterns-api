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
  // getting here now
  // console.log("INSIDE PREHOOK", this)
  let target = this;
  let parent = null;
    // deletes all children of target asset (not necessarily all descendants)
  db.Asset.remove({parent: target.id})
  .then(function(){
    console.log("INSIDE .THEN");
    parent = db.Asset.findById(target.parent);
    return parent.save();
  })
  .then(function(){
    // deletes it from its parent's assets array
    console.log("PARENT",parent);
    let foundIdx = parent.assets.indexOf(target.id);
    parent.assets.splice(foundIdx, 1);
    return parent.save();
  })
  .then(function(parent){
    next();
  }, function(err){
    next(err);
  });
});

assetSchema.plugin(findOrCreate);
const Asset = mongoose.model('Asset', assetSchema);
module.exports = Asset;
