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

typeSchema.pre('remove', function(next) {
  let type = this;
  db.Asset.remove({typeId: type.id})
  .then(function(foundAssets){
    next();
  })
  .catch(function(err){
    next(err);
  });
});

typeSchema.plugin(findOrCreate);
const Type = mongoose.model('Type', typeSchema);
module.exports = Type;
