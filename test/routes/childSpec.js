const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/patterns-testDb');
var db = require("../../models");
var app = require("../../app");
const login = require("../helpers").login;
const testingData = require("../helpers").testingData;
const request = require('supertest');
const jwt = require('jsonwebtoken');
const expect = require('chai').expect;

describe('GET /assets/:a_id/childassets', function() {
  let asset = null;
  let child = null;
  before(function(done) {
    db.Asset.create({
      name:'Facebook',
      url:'https://www.facebook.com/',
      logo:'https://facebookbrand.com/wp-content/themes/fb-branding/prj-fb-branding/assets/images/fb-art.png'
    })
    .then(function(newAsset) {
      asset = newAsset;
      child = new db.Asset({
        name:'Funding'
      })
      return child.save()
    })
    .then(function(child) {
      asset.assets.push(child._id);
      return asset.save()
    })
    .then(function() {
      done();
    })
    .catch(function(error){
      console.log(error);
    });
  });

  it('adds a child asset to asset list if token is valid', function(done) {
    const token = login(testingData);
    request(app)
      .get(`/assets/${asset.id}/childassets`)
      .set('authorization', 'Bearer: ' + token)
      .expect(200)
      .expect(function(res) {
        expect(res.body.name).to.equal('Facebook');
        expect(res.body.url).to.equal('https://www.facebook.com/');
        expect(res.body.logo).to.equal('https://facebookbrand.com/wp-content/themes/fb-branding/prj-fb-branding/assets/images/fb-art.png');
        expect(res.body.assets.length).to.equal(1);
        expect(res.body.assets[0].name).to.equal('Funding');
      })
    .end(done);
  });

  after(function(done) {
    db.Asset.remove({})
    .then(function() {
      done();
    });
  });

});
