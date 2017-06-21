var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');
var userSchema = new mongoose.Schema({
  googleId: {
    type: String, 
    required: true
  },
  email: {
    type: String, 
    required: true
  }, 
  firstName: String,
  lastName: String
});

userSchema.plugin(findOrCreate);

var User = mongoose.model('User', userSchema);

module.exports = User;
