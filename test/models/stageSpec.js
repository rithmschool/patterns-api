var expect = require('chai').expect;

var Stage = require('../../models/activity');

describe('stage model', function() {
  it('should be invalid if activity name is empty', function(done) {
    var a = new Stage();
    a.validate(function(err) {
      expect(err.errors.name).to.exist;
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