var expect = require('chai').expect;
const db = require('../../models');
const setup = require('../seed').setup;
const teardown = require('../seed').teardown;

describe('Stage model', function() {

  describe('Basic validations', function() {

    it('should be invalid if name is empty', function(done) {
      var a = new db.Stage();
      a.validate(function(err) {
        expect(err.errors.name).to.exist;
        done();
      });
    });

    it('should be invalid if createdBy is empty', function(done) {
      var a = new db.Stage();
      a.validate(function(err) {
        expect(err.errors.createdBy).to.exist;
        done();
      });
    });

    it('should be invalid if activity is empty', function(done) {
      var a = new db.Stage();
      a.validate(function(err) {
        expect(err.errors.activity).to.exist;
        done();
      });
    });

    it('should create a default createdAt date', function(done) {
      var a = new db.Stage( { name: 'Research' });
      expect(a.createdAt).to.be.a('date');
      done();
    });

    it('should create a default updatedAt date', function(done) {
      var a = new db.Stage( { name: 'Research' });
      expect(a.updatedAt).to.be.a('date');
      done();
    });

  });

  describe('Pre-save hook', function() {

    let user = null;
    let activity = null;

    before(function(done) {
      setup().then(function() {
        return db.User.findOne({firstName: 'Alice'}).populate('activities')
      })
      .then(function(alice) {
        user = alice;
        activity = user.activities[0];
        done();
      })
      .catch(done);
    });

    it("should update the activity's array of stages", function(done) {
      const oldLength = activity.stages.length;
      let newStageId = null;
      db.Stage.create({
        name: 'test',
        activity: activity.id,
        createdBy: user.id
      })
      .then(function(stage) {
        newStageId = stage.id
        return db.Activity.findById(activity.id)
      })
      .then(function(updatedActivity) {
        let newLength = updatedActivity.stages.length;
        expect(newLength).to.equal(oldLength + 1);
        expect(updatedActivity.stages[newLength - 1].toString()).to.equal(newStageId);
      })
      .then(function() {
        done()
      })
      .catch(done);
    });

    it("should not add if the stage isn't new", function(done) {
      let length = activity.stages.length;
      db.Activity.findById(activity.id).populate('stages')
      .then(function(activity) {
        let stage = activity.stages[0];
        stage.name = "new name";
        return stage.save();
      })
      .then(function() {
        expect(activity.stages.length).to.equal(length);
        done()
      })
      .catch(done);
    });

    after(teardown);

  });

});
