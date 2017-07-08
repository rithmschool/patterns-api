const expect = require('chai').expect;
const db = require('../../models');
const teardown = require('../seed').teardown;

describe("User model", function() {

  describe('Basic validations', function() {
    it('should be invalid if googleId is empty', function(done) {
      const u = new db.User();

      u.validate(function(err) {
        expect(err.errors.googleId).to.exist;
        done();
      });
    });

    it('should be invalid if email is empty', function(done) {
      const u = new db.User();

      u.validate(function(err) {
        expect(err.errors.email).to.exist;
        done();
      });
    });
  });

  describe("Pre-save hook", function() {
    let user = null;
    before(function(done) {
      db.User.create({
        email: 'test@example.com',
        googleId: 'fakeid'
      })
      .then(function(newUser) {
        user = newUser;
        done();
      })
      .catch(done);
    });

    it("should create a default activity if the user is new", function(done) {
      expect(user.activities.length).to.equal(1);
      db.Activity.findById(user.activities[0]).populate('stages')
      .then(function(activity) {
        expect(activity.name).to.equal("Job Search");
        expect(activity.stages.length).to.equal(3);
        expect(activity.stages.map(s => s.name)).to.have.members([
          "Research",
          "Apply",
          "Follow Up"
        ]);
      })
      .then(function() {
        done()
      })
      .catch(done);
    });

    it("should not add a default activity for an existing user", function(done) {
      user.email = "newemail@example.com"
      user.save()
      .then(function() {
        expect(user.activities.length).to.equal(1);
        done();
      })
      .catch(done);
    });

    after(teardown);

  });

});