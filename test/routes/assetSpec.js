const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/patterns-testDb');
var db = require("../../models");
var app = require("../../app");
const login = require("../helpers").login;
const testingData = require("../helpers").testingData;
const request = require('supertest');
const jwt = require('jsonwebtoken');
const expect = require('chai').expect;

let type = null;

describe('GET /types/:id/assets', function() {
  before(function(done) {
    db.Type.create({ 
      isAgent: false, 
      name:'Brand'
    })
    .then(function(newType) {
      type = newType;
      const asset = new db.Asset({
        name:'Google',
        description:'We know everything about you'
      })
      asset.typeId = type.id;
      return asset.save()
    })
    .then(function(asset) {
      type.assets.push(asset.id);
      return type.save()
    })
    .then(function() {
      done();
    })
    .catch(function(error){
      console.log(error);
    });
  });

  it('responds with an array of assets if token is valid', function(done) {
    const token = login(testingData);
    request(app)
      .get(`/types/${type.id}/assets`)
      .set('authorization', 'Bearer: ' + token)
      .expect(200)
      .expect(function(res) {
        expect(res.body.isAgent).to.be.false;
        expect(res.body.name).to.equal('Brand');
        expect(res.body.assets.length).to.equal(1);
        expect(res.body.assets[0].name).to.equal('Google');
        expect(res.body.assets[0].description).to.equal('We know everything about you');
      })
      .end(done);
  }); 

  it('should be invalid if token is invalid', function(done) {
    request(app)
      .get(`/types/${type.id}/assets`)
      .set('authorization', 'Bearer: ' + jwt.sign(testingData, 'wrong key'))
      .expect(401, {
        message: "Invalid user."
      }, done);
  });

  it('it should be invalid if there is no token', function(done) {
    request(app)
      .get(`/types/${type.id}/assets`)
      .expect(401, {
        message: "You must be logged in to continue."
      }, done);
  });

  after(function(done) {
    db.Type.remove({})
    .then(function() {
      return db.Asset.remove({})
    })
    .then(function() {
      done();
  });
});
});
