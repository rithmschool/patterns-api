const mongoose = require('mongoose');
const db = require('../models');

function setup(done) {
  let users = [];
  let types = [];
  let activities = [];
  return db.User.create([{
    googleId: "1",
    firstName: "Alice",
    lastName: "Smith",
    email: "alice@example.com"
  }, {
    googleId: "2",
    firstName: "Bob",
    lastName: "Jones",
    email: "bob@example.com"
  }])
  .then(function(createdUsers) {
    users = createdUsers;
    return db.Type.create([{
      isAgent: true,
      name: "Company",
      createdBy: users[0].id
    }, {
      isAgent: false,
      name: "Brand",
      createdBy: users[1].id
    }, {
      isAgent: true,
      name: "Employees",
      createdBy: users[0].id
    }])
  })
  .then(function(createdTypes) {
    types = createdTypes;
    return db.Activity.create([{
      name: "Alice's Job Search",
      createdBy: users[0].id,
      rootAssetType: types[0].id
    }, {
      name: "Bob's Job Search",
      createdBy: users[1].id,
      rootAssetType: types[0].id
    }, {
      name: "Bob's Other Job Search",
      createdBy: users[1].id,
      rootAssetType: types[0].id
    }])
  })
  .then(function(createdActivities) {
    activities = createdActivities;
    return db.Stage.create([{
      name: "Alice's Research",
      createdBy: users[0].id,
      activity: activities[0].id,
    }, {
      name: "Alice's Follow Up",
      createdBy: users[0].id,
      activity: activities[0].id
    }, {
      name: "Bob's Ideas",
      createdBy: users[1].id,
      activity: activities[1].id
    }, {
      name: "Bob's Other Ideas",
      createdBy: users[1].id,
      activity: activities[2].id
    }, {
      name: "Bob's Other Research",
      createdBy: users[1].id,
      activity: activities[2].id
    }, {
      name: "Bob's Other Follow Up",
      createdBy: users[1].id,
      activity: activities[2].id
    }])
  })
}

function teardown(done) {
  mongoose.connection.db.dropDatabase(function() {
    done();
  })
}

module.exports = { setup, teardown };