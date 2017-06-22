const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/patterns-testDb');
var db = require("../../models");
var app = require("../../app");
const login = require("../helpers");
const request = require('supertest');

beforeEach(function(done) {
  let type = null;
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
  })
})

describe('GET /types/:id/assets', function() {
  it('responds with json if token is valid', function(done) {
    const token = login()
    console.log(token)
    request(app)
      .get('/types/:id/assets')
      .set('Authorization', 'Bearer:' + token)
      .expect(200, /* TODO */ done);
  });

  it('should be invalid if token is invalid', function(done) {
    request(app)
      .get('/types/:id/assets')
      .expect(401, {
        message: "You must be logged in to continue."
      }, done);
  });

  it('it should be invalid if there is no token', function(done) {
    request(app)
      .get('/types/:id/assets')
      .expect(401, {
        message: "You must be logged in to continue."
      }, done);
  });


});

//if no token, send back error (400)
//if valid token, send back the data with 200
// if there's a token, but it's invalid , send error