const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
const tree = require('mongoose-path-tree-promisify');
const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  url: String,
  logo: String,
  assets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true
    }
  ],
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
    ref: 'Asset',
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

assetSchema.plugin(findOrCreate);
assetSchema.plugin(tree, { parentExists: true });

assetSchema.pre('save', function(next) {
  let asset = this;
  if (asset.isNew) {
    return mongoose
      .model('Type')
      .findById(asset.typeId)
      .then(type => {
        type.assets.push(asset.id);
        return type.save();
      })
      .then(type => mongoose.model('Asset').findById(asset.parent))
      .then(parent => {
        if (parent) {
          parent.assets.push(asset.id);
          return parent.save();
        }
      })
      .then(() => next())
      .catch(err => next(err));
  }
  return next();
});

assetSchema.pre('remove', function(next) {
  let asset = this;
  let descendants = null;
  asset
    .getChildren(true)
    .then(children => {
      descendants = children;
      return mongoose
        .model('Asset')
        .remove({ _id: { $in: descendants.map(d => d._id) } });
    })
    .then(() => mongoose.model('Asset').findById(asset.parent))
    .then(foundParent => {
      if (foundParent) {
        foundParent.assets.pull(asset.id);
        return foundParent.save();
      }
    })
    .then(() => {
      let typesToUpdate = descendants.concat(asset).reduce((acc, asset) => {
        acc[asset.typeId] = acc[asset.typeId] || new Set();
        acc[asset.typeId].add(asset.id);
        return acc;
      }, {});
      return Promise.all(
        Object.keys(typesToUpdate).map(id => {
          return mongoose.model('Type').findByIdAndUpdate(id, {
            $pullAll: { assets: Array.from(typesToUpdate[id]) }
          });
        })
      );
    })
    .then(() =>
      mongoose
        .model('Stage')
        .find({ assets: { $in: descendants.concat(asset).map(d => d._id) } })
    )
    .then(stages =>
      Promise.all(
        stages.map(stage =>
          mongoose.model('Stage').findByIdAndUpdate(stage.id, {
            $pullAll: { assets: descendants.concat(asset).map(d => d._id) }
          })
        )
      )
    )
    .then(() => next())
    .catch(next);
});

const Asset = mongoose.model('Asset', assetSchema);
module.exports = Asset;
