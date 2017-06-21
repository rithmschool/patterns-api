var mongoose = require("mongoose");
mongoose.set('debug', true);
mongoose.connect('mongodb://localhost/patterns');
mongoose.Promise = Promise;

module.exports.User = require("./user");
module.exports.Type = require("./type");
module.exports.Asset = require("./asset");
