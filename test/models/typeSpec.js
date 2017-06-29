var expect = require('chai').expect;

var Type = require('../../models/type');
 
describe('type model', function() {
  it('should be invalid if name is empty', function(done) {
    var t = new Type();
    t.validate(function(err) {
      expect(err.errors.name).to.exist;
      done();
    });
  });

  it('should be invalid if isAgent is empty', function(done) {
    var t = new Type();
    t.validate(function(err) {
      expect(err.errors.isAgent).to.exist;
      done();
    });
  });

  it('should be invalid if createdBy is empty', function(done) {
    var t = new Type();
    t.validate(function(err) {
      expect(err.errors.createdBy).to.exist;
      done();
    });
  });
});
