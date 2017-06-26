const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/patterns-testDb');
var db = require("../../models");
var app = require("../../app");
const login = require("../helpers").login;
const testingData = require("../helpers").testingData;
const request = require('supertest');
const jwt = require('jsonwebtoken');
const expect = require('chai').expect;


describe('GET /users/:u_id/activities/', function() {
  let activity = null;
  let stage = null;
  let user = null;
  before(function(done) {
    user = new db.User(testingData);
    user.save()
      .then(function(newUser){
        user = newUser;
        activity = new db.Activity({
          name: 'Job search June 2017',
          user: newUser.id
        });
        return activity.save();
      })
      .then(function(newActivity){
        user.activities.push(newActivity._id);
        activity = newActivity;
        return user.save();
      })
      .then(function(user) {
        stage = new db.Stage({
          name: 'Research',
          activity: activity.id
        })
        return stage.save()
      })
      .then(function(stage) {
        activity.stages.push(stage._id);
        return activity.save()
      })
      .then(() => { 
        done()
      })
      .catch((err) => done(err));
  });

  it('responds with an activity if token is valid', function(done) { 
    const token = login(testingData);
    request(app)
      .get(`/users/${activity.user}/activities/`)
      .set('authorization', 'Bearer: ' + token)
      .expect(200)
      .expect(function(res) {
        expect(res.body[0].name).to.equal('Job search June 2017');
        expect(res.body[0].stages.length).to.equal(1);
        expect(res.body[0].stages[0].name).to.equal('Research');
      })
      .end(done);
  });

  it('it should be invalid if there is no token', function(done) {
    request(app)
      .get(`/users/${activity.user}/activities/`)
      .expect(401, {
        message: "You must be logged in to continue."
      }, done);
  });

  after(function(done) {
    db.Activity.remove({})
    .then(function() {
      return db.User.remove({})
    }).then(function() {
      return db.Stage.remove({})
    }).then(function() {
      done();
    });
  });
});
