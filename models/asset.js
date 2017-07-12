const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");
const tree = require("mongoose-path-tree-promisify");
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
  } else {
    next();
  }
});

assetSchema.pre('remove', function(next) {
  let asset = this;
  let descendants = null;
  asset.getChildren(true).then(children => {
    descendants = children;
    return mongoose.model('Asset').remove({ _id: { $in: descendants.map(d => d._id) }})
  })
  .then(function() {
    return mongoose.model('Asset').findById(asset.parent)
  })
  .then(function(foundParent){
    if(foundParent){
      foundParent.assets.pull(asset.id);
      return foundParent.save();
    }
  })
  .then(function() {
    let typesToUpdate = descendants.concat(asset).reduce(function(acc, asset) {
      acc[asset.typeId] = acc[asset.typeId] || new Set();
      acc[asset.typeId].add(asset.id);
      return acc;
    }, {})
    return Promise.all(Object.keys(typesToUpdate).map(function(id) {
      return mongoose.model('Type').findByIdAndUpdate(id, {
        $pullAll: { assets: Array.from(typesToUpdate[id]) }
      })
    }))
  })
  .then(function() {
    return mongoose.model('Stage').find({ assets: { $in: descendants.concat(asset).map(d => d._id) }})
  })
  .then(function(stages) {
    return Promise.all(stages.map(function(stage) {
      return mongoose.model('Stage').findByIdAndUpdate(stage.id, {
        $pullAll: { assets: descendants.concat(asset).map(d => d._id) }
      })
    }))
  })
  .then(function() {
    next();
  })
  .catch(next);
});

const Asset = mongoose.model('Asset', assetSchema);
module.exports = Asset;
