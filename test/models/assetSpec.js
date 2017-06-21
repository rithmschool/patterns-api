var expect = require('chai').expect;

var Asset = require('../../models/asset');
 
describe('asset model', function() {
  it('should be invalid if name is empty', function(done) {
    var a = new Asset();
    a.validate(function(err) {
      expect(err.errors.name).to.exist;
      done();
    });
  });

  it('should create a default createdAt date', function(done) {
    var a = new Asset( { name: 'company '});
    expect(a.createdAt).to.be.a('date');
    done();
  });

  it('should create a default updatedAt date', function(done) {
    var a = new Asset( { name: 'company '});
    expect(a.updatedAt).to.be.a('date');
    done();
  });
});
