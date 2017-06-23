const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/patterns-testDb');
var db = require("../../models");
var app = require("../../app");
const login = require("../helpers").login;
const testingData = require("../helpers").testingData;
const request = require('supertest');
const expect = require('chai').expect;

describe('GET /types', function() {
  before(function(done) {
    db.Type.create({
      isAgent: true,
      name: 'Company'
    })
    .then(function() {
      done();
    })
    .catch(function(error) {
      console.log(error);
    });
  });

  it('responds with a type if token is valid', function(done) { 
    const token = login(testingData);
    request(app)
      .get('/types')
      .set('authorization', 'Bearer: ' + token)
      .expect(200)
      .expect(function(res) {
        expect(res.body[0].isAgent).to.be.true;
        expect(res.body[0].name).to.equal('Company');
      })
      .end(done);
  });

  it('it should be invalid if there is no token', function(done) {
    request(app)
      .get('/types')
      .expect(401, {
        message: "You must be logged in to continue."
      }, done);
  });

  after(function(done) {
    db.Type.remove({})
    .then(function() {
      done();
    });
  });
});
