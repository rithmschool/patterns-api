const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/patterns-testDb');
const db = require("../../models");
const app = require("../../app");
const login = require("../helpers").login;
const testingData = require("../helpers").testingData;
const request = require('supertest');
const jwt = require('jsonwebtoken');
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

describe('POST /types', function() {
  it('creates a type if token is valid', function(done) { 
    const token = login(testingData);
    request(app)
      .post('/types')
      .send({
        name: 'Logo',
        isAgent: false
      })
      .set('authorization', 'Bearer: ' + token)
      .expect(200)
      .expect(function(res) {
        expect(res.body.isAgent).to.be.false;
        expect(res.body.name).to.equal('Logo');
      })
      .end(done);
  });

  it('it should be invalid if there is no token', function(done) {
    request(app)
      .post('/types')
      .send({stuff: "here"})
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

describe('PATCH /types/:t_id', function() {
  let type = null;
  before(function(done) {
    db.Type.create({ 
      isAgent: false, 
      name: 'Corporation'
    })
    .then(function(newType){
      type = newType;
      done();
    })
    .catch(function(error){
      console.log(error);
    });
  })

  it('updates a type if token is valid', function(done) {
    const token = login(testingData);
    request(app)
      .patch(`/types/${type.id}`)
      .send({
        name:'Business'
      })
      .set('authorization', 'Bearer: ' + token)
      .expect(200)
      .expect(function(res) {
        expect(res.body.name).to.equal('Business');
        expect(res.body.isAgent).to.be.false;
      })
      .end(done);
    });

    it('it should be invalid if there is no token', function(done) {
      request(app)
        .patch(`/types/${type.id}`)
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

describe('DELETE /types/:t_id', function() {
  let type = null;
  let asset = null;
  before(function(done) {
    db.Type.create({
      isAgent: true,
      name: 'Employees'
    })
    .then(function(newType) {
      type = newType;
      return db.Asset.create({
        name: "Matt",
        typeId: type.id
      });
    })
    .then(function(newAsset) {
      asset = newAsset;
      type.assets.push(asset);
      return type.save();
    })
    .then(function() {
      done();
    })
    .catch(function(error) {
      console.log(error);
    });
  });

  it('deletes a type and all assets of that type if token is valid', function(done) { 
    const token = login(testingData);
    request(app)
      .delete(`/types/${type.id}`)
      .set('authorization', 'Bearer: ' + token)
      .expect(200)
      .expect(function(res) {
        expect(res.body).to.deep.equal({});
        db.Asset.find({typeId: type.id})
        .then(function(foundAssets) {
          expect(foundAssets.length).to.equal(0)
        })
        .then(function() {
          done();
        })
        .catch(function(error){
          console.log(error);
        });
      })
      .then(function() {
        done();
      })
      .catch(function(error){
        console.log(error);
      });
  });

  it('it should be invalid if there is no token', function(done) {
    request(app)
      .delete(`/types/${type.id}`)
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
      return db.Asset.remove({})
    })
    .then(function() {
      done();
    });
  });
});

describe('PATCH /types/:t_id/assets/:a_id', function() {
  let type = null;
  let asset = null;
  before(function(done) {
    db.Type.create({ 
      isAgent: false, 
      name: 'Corporation'
    })
    .then(function(newType){
      type = newType;
      return db.Asset.create({
        name: 'Microsoft',
        url: 'https://www.microsoft.com/en-us/',
        logo: 'http://diylogodesigns.com/blog/wp-content/uploads/2016/04/Microsoft-Logo-PNG.png',
        typeId: newType.id
      });
    })
    .then(function(newAsset) {
      asset = newAsset;
      type.assets.push(asset._id);
      return type.save()
    })
    .then(function() {
      done();
    })
    .catch(function(error){
      console.log(error);
    });
  })

  it('updates an asset of the given type if token is valid', function(done) {
    const token = login(testingData);
    request(app)
      .patch(`/types/${type.id}/assets/${asset.id}`)
      .send({
        name:'Amazon'
      })
      .set('authorization', 'Bearer: ' + token)
      .expect(200)
      .expect(function(res) {
        expect(res.body.name).to.equal('Amazon');
        expect(res.body.url).to.equal('https://www.microsoft.com/en-us/');
      })
      .end(done);
    });

    it('it should be invalid if there is no token', function(done) {
      request(app)
        .patch(`/types/${type.id}/assets/${asset.id}`)
        .send({random:"data"})
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

describe('DELETE /types/:t_id/assets/:a_id', function() {
  let asset = null; // Microsoft
  let type = null; // Corporation
  before(function(done) {
    db.Type.create({ 
      isAgent: false, 
      name: 'Corporation'
    })
    .then(function(newType){
      type = newType;
      return db.Asset.create({
        name: 'Microsoft',
        url: 'https://www.microsoft.com/en-us/',
        logo: 'http://diylogodesigns.com/blog/wp-content/uploads/2016/04/Microsoft-Logo-PNG.png',
        typeId: newType.id
      });
    })
    .then(function(newAsset) {
      asset = newAsset;
      type.assets.push(asset._id);
      return type.save()
    })
    .then(function() {
      done();
    })
    .catch(function(error){
      console.log(error);
    });
  })

  it("deletes asset of a certain type and asset's descendants if token is valid", function(done) {
    const token = login(testingData);
    request(app)
      .delete(`/types/${type.id}/assets/${asset.id}`)
      .set('authorization', 'Bearer: ' + token)
      .expect(200)
      .expect(function(res, req) {
        expect(res.body).to.deep.equal({});
        db.Type.findById(type.id)
        .then(function(foundType) {
          expect(foundType.assets.indexOf(asset.id)).to.equal(-1);
        })
        .then(function(){
          db.Asset.findOne(asset);
        })
        .then(function(foundAsset) {
          expect(foundAsset).to.equal(null);
        })
        .then(function() {
          done();
        })
        .catch(function(error){
          console.log(error);
        });
      })
      .then(function() {
        done();
      })
      .catch(function(error){
        console.log(error);
      });
    });

    it('it should be invalid if there is no token', function(done) {
      request(app)
        .delete(`/types/${type.id}/assets/${asset.id}`)
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
