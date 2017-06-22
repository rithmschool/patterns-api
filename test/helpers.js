const request = require('supertest');
const app = require('../app');
var expect = require('chai').expect;
var mongoose = require('mongoose');
mongoose.Promise = Promise;
var db = require('../models/');
var jwt = require('jsonwebtoken');

const testingData = {
  googleId: "104710937652817506441",
  firstName:"Testing",
  lastName:"Patterns-Api",
  email:"testing.patterns.api@gmail.com",
  // "iat":1498093753
}

const secret = 'whiskey2.0';

function login(user){
  return jwt.sign(user, secret)
}

module.exports = login;
