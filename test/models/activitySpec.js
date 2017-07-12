const expect = require('chai').expect;
const db = require('../../models');
const setup = require('../seed').setup;
const teardown = require('../seed').teardown;

describe('Activity model', function() {

  describe('Basic validations', function() {

    it('should be invalid if activity name is empty', function(done) {
      var a = new db.Activity();
      a.validate(function(err) {
        expect(err.errors.name).to.exist;
        done();
      });
    });

    it('should be invalid if activity rootAssetType is empty', function(done) {
      var a = new db.Activity();
      a.validate(function(err) {
        expect(err.errors.rootAssetType).to.exist;
        done();
      });
    });

    it('should be invalid if activity createdBy is empty', function(done) {
      var a = new db.Activity();
      a.validate(function(err) {
        expect(err.errors.createdBy).to.exist;
        done();
      });
    });

    it('should create a default createdAt date', function(done) {
      var a = new db.Activity( { name: 'Job Search 2017' });
      expect(a.createdAt).to.be.a('date');
      done();
    });

    it('should create a default updatedAt date', function(done) {
      var a = new db.Activity( { name: 'Job Search 2017' });
      expect(a.updatedAt).to.be.a('date');
      done();
    });

  });

  describe('Pre-save hook', function() {

    let user = null;
    let companyType = null;

    before(function(done) {
      setup().then(function() {
        return db.User.findOne({firstName: 'Alice'})
      })
      .then(function(alice) {
        user = alice;
        return db.Type.findOne({name: "Company"})
      })
      .then(function(type) {
        companyType = type;
        done();
      })
      .catch(done);
    });

    it("should update the owner's array of activities", function(done) {
      const oldLength = user.activities.length;
      let newActivityId = null;
      db.Activity.create({
        name: 'test',
        createdBy: user.id,
        rootAssetType: companyType.id
      })
      .then(function(activity) {
        newActivityId = activity.id
        return db.User.findById(user.id)
      })
      .then(function(updatedUser) {
        let newLength = updatedUser.activities.length;
        expect(newLength).to.equal(oldLength + 1);
        expect(updatedUser.activities[newLength - 1].toString()).to.equal(newActivityId);
      })
      .then(function() {
        done()
      })
      .catch(done);
    });

    it("should not add if the activity isn't new", function(done) {
      let length = user.activities.length;
      db.User.findById(user.id).populate('activities')
      .then(function(user) {
        let activity = user.activities[0];
        activity.name = "new name";
        return activity.save();
      })
      .then(function() {
        expect(user.activities.length).to.equal(length);
        done()
      })
      .catch(done);
    });

    after(teardown);
    
  });

});
