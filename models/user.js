var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');
var userSchema = new mongoose.Schema({
  googleId: String, 
  firstName: String,
  lastName: String
});

userSchema.plugin(findOrCreate);

var User = mongoose.model('User', userSchema);

module.exports = User;
