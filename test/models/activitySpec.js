var expect = require('chai').expect;

var Activity = require('../../models/activity');

xdescribe('activity model', function() {

  it('should be invalid if activity name is empty', function(done) {
    var a = new Activity();
    a.validate(function(err) {
      expect(err.errors.name).to.exist;
      done();
    });
  });

  it('should be invalid if activity rootAssetType is empty', function(done) {
    var a = new Activity();
    a.validate(function(err) {
      expect(err.errors.rootAssetType).to.exist;
      done();
    });
  });

  it('should be invalid if activity createdBy is empty', function(done) {
    var a = new Activity();
    a.validate(function(err) {
      expect(err.errors.createdBy).to.exist;
      done();
    });
  });

  it('should create a default createdAt date', function(done) {
    var a = new Activity( { name: 'Job Search 2017' });
    expect(a.createdAt).to.be.a('date');
    done();
  });

  it('should create a default updatedAt date', function(done) {
    var a = new Activity( { name: 'Job Search 2017' });
    expect(a.updatedAt).to.be.a('date');
    done();
  });

});
