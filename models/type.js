const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
const typeSchema = new mongoose.Schema(
  {
    isAgent: {
      type: Boolean,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    assets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asset'
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

typeSchema.pre('remove', function(next) {
  let type = this;
  return mongoose
    .model('Asset')
    .find({ typeId: type.id })
    .then(foundAssets => Promise.all(foundAssets.map(asset => asset.remove())))
    .then(() => next())
    .catch(() => next());
});

typeSchema.plugin(findOrCreate);
const Type = mongoose.model('Type', typeSchema);
module.exports = Type;
