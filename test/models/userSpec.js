var expect = require('chai').expect;

var User = require('../../models/user');
 
describe('user model', function() {
  it('should be invalid if googleId is empty', function(done) {
    var u = new User();

    u.validate(function(err) {
      expect(err.errors.googleId).to.exist;
      done();
    });
  });

  it('should be invalid if email is empty', function(done) {
    var u = new User();

    u.validate(function(err) {
      expect(err.errors.email).to.exist;
      done();
    });
  });
});
