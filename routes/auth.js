var express = require("express");
var router = express.Router();
var jwt = require('jsonwebtoken');
var passport = require("passport");
var db = require("../models");
var cors = require("cors");
var axios = require('axios');
var qs = require("qs");

router.get('/google',
  passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/plus.login',
      'https://www.googleapis.com/auth/userinfo.profile', 
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  })
);

router.post('/google/callback',
  function(request, response) {
    axios({
      method: 'post',
      url: 'https://www.googleapis.com/oauth2/v4/token',
      data: qs.stringify({
        code: request.body.code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.CALLBACK_URL,
        grant_type: 'authorization_code'
      }),
      headers: {
        'content-type': 'application/x-www-form-urlencoded' 
      }
    })
    .then(function(res){
      return axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${res.data.access_token}`);
    })
    .then(function(res){
      db.User.findOrCreate({ 
        googleId: res.data.id, 
        firstName: res.data.given_name, 
        lastName: res.data.family_name,
        email:res.data.email 
      }, 
      function (err, user) {
        if (err) { return done(err); }
        const payload = {
          googleId: user.googleId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
        const token = jwt.sign(payload, process.env.SECRET_KEY);
        eval(require("locus"))
        response.status(200).send(token);
      });
    })
    .catch(function(error) {
      response.status(500).send(error);
    });
  }
);

module.exports = router;
