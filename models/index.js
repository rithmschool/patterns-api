const mongoose = require('mongoose');
const config = require('../config');
mongoose.set('debug', config.mongooseDebug);
mongoose.connect(config.mongoUri);
mongoose.Promise = Promise;

module.exports.User = require('./user');
module.exports.Type = require('./type');
module.exports.Asset = require('./asset');
module.exports.Activity = require('./activity');
module.exports.Stage = require('./stage');
