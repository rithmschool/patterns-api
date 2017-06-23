const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/patterns-testDb');
var db = require("../../models");
var app = require("../../app");
const login = require("../helpers").login;
const testingData = require("../helpers").testingData;
const request = require('supertest');
const jwt = require('jsonwebtoken');
const expect = require('chai').expect;

describe('GET /types/:id/assets', function() {
  let type = null;
  before(function(done) {
    db.Type.create({ 
      isAgent: false, 
      name:'Brand'
    })
    .then(function(newType) {
      type = newType;
      const asset = new db.Asset({
        name:'Google',
        url:'https://www.google.com/',
        logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2000px-Google_2015_logo.svg.png'
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
        expect(res.body.assets[0].url).to.equal('https://www.google.com/');
        expect(res.body.assets[0].logo).to.equal('https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2000px-Google_2015_logo.svg.png');
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

describe('POST /types/:id/assets', function() {
  let type = null;
  before(function(done) {
    db.Type.create({ 
      isAgent: false, 
      name:'Conglomerate'
    })
    .then(function(newType) {
      type = newType;
      done();
    })
    .catch(function(error){
      console.log(error);
    });
  })

  it('creates a new asset of the given type if token is valid', function(done) {
    const token = login(testingData);
    request(app)
      .post(`/types/${type.id}/assets`)
      .send({
        name:'Amazon',
        url:'https://www.amazon.com/',
        logo:'http://static1.businessinsider.com/image/539f3ffbecad044276726c01-960/amazon-com-logo.jpg'
      })
      .set('authorization', 'Bearer: ' + token)
      .expect(200)
      .expect(function(res) {
        expect(res.body.name).to.equal('Amazon');
        expect(res.body.url).to.equal('https://www.amazon.com/');
        expect(res.body.logo).to.equal('http://static1.businessinsider.com/image/539f3ffbecad044276726c01-960/amazon-com-logo.jpg');
        expect(res.body.id).to.not.be.null;
      })
      .end(done);
    });

    it('it should be invalid if there is no token', function(done) {
      request(app)
        .post(`/types/${type.id}/assets`)
        .send({random:"data"})
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
