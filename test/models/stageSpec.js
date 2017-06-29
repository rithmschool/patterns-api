var expect = require('chai').expect;

var Stage = require('../../models/stage');

describe('stage model', function() {
  it('should be invalid if name is empty', function(done) {
    var a = new Stage();
    a.validate(function(err) {
      expect(err.errors.name).to.exist;
      done();
    });
  });

  it('should be invalid if createdBy is empty', function(done) {
    var a = new Stage();
    a.validate(function(err) {
      expect(err.errors.createdBy).to.exist;
      done();
    });
  });

  it('should be invalid if activity is empty', function(done) {
    var a = new Stage();
    a.validate(function(err) {
      expect(err.errors.activity).to.exist;
      done();
    });
  });

  it('should create a default createdAt date', function(done) {
    var a = new Stage( { name: 'Research' });
    expect(a.createdAt).to.be.a('date');
    done();
  });

  it('should create a default updatedAt date', function(done) {
    var a = new Stage( { name: 'Research' });
    expect(a.updatedAt).to.be.a('date');
    done();
  });
});
