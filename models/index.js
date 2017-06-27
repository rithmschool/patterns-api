var mongoose = require("mongoose");
mongoose.set('debug', process.env.NODE_ENV !== 'production');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/patterns');
mongoose.Promise = Promise;

module.exports.User = require("./user");
module.exports.Type = require("./type");
module.exports.Asset = require("./asset");
module.exports.Activity = require("./activity");
module.exports.Stage = require("./stage");
