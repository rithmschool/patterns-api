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
  this.constructor.remove({parent: target.id})
  .then(function(){
    return this.constructor.findById(target.parent);
  })
  .then(function(foundParent){
    if(foundParent){
      parent = foundParent;
      let foundIdx = parent.assets.indexOf(target.id);
      parent.assets.splice(foundIdx, 1);
      return parent.save();
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
