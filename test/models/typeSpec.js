const expect = require('chai').expect;
const db = require('../../models');
const setup = require('../seed').setup;
const teardown = require('../seed').teardown;
 
describe('Type model', function() {

  describe('Basic Validations', function() {

    it('should be invalid if name is empty', function(done) {
      const t = new db.Type();
      t.validate(function(err) {
        expect(err.errors.name).to.exist;
        done();
      });
    });

    it('should be invalid if isAgent is empty', function(done) {
      const t = new db.Type();
      t.validate(function(err) {
        expect(err.errors.isAgent).to.exist;
        done();
      });
    });

    it('should be invalid if createdBy is empty', function(done) {
      const t = new db.Type();
      t.validate(function(err) {
        expect(err.errors.createdBy).to.exist;
        done();
      });
    });

  });

  describe('Pre-remove hook', function() {
    before(function(done) {
      setup().then(function() {
        done();
      })
      .catch(done);
    });

    it('should remove all assets of that type', function(done) {
      let companyType = null;
      db.Type.findOne({name: "Company"})
      .then(function(company) {
        companyType = company;
        expect(companyType.assets.length).to.equal(2);
        return company.remove();
      })
      .then(function() {
        return db.Asset.find({typeId: companyType.id});
      })
      .then(function(assets) {
        expect(assets.length).to.equal(0);
        done();
      })
      .catch(done);
    });

  });
});
