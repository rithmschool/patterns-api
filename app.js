var express = require("express");
var app = express();
var methodOverride = require("method-override");
var morgan = require("morgan");
var bodyParser = require("body-parser");
var jwt = require('jsonwebtoken');
var passport = require("passport");
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var db = require("./models");
var cors = require("cors");
var axios = require('axios');
var qs = require("qs");

if (process.env.NODE_ENV !== 'production') {
  require("dotenv").config();
}

app.use(express.static(__dirname + "/public"));
app.use(morgan("tiny"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride("_method"));
app.use(cors());
app.use(passport.initialize());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL,
  session: false,
  passReqToCallback: true
},
  function(req, reqaccessToken, refreshToken, profile, done) {
    return done(null);
  }
));

app.get('/auth/google',
  passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/plus.login',
      'https://www.googleapis.com/auth/userinfo.profile', 
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  })
);

app.post('/auth/google/callback',
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
        lastName: res.data.family_name 
      }, 
      function (err, user) {
        if (err) { return done(err); }
        const payload = {
          googleId: user.googleId,
          firstName: user.firstName,
          lastName: user.lastName
        }
        const token = jwt.sign(payload, process.env.SECRET_KEY);
        response.status(200).send(token);
      });
    })
    .catch(function(error) {
      response.status(500).send(error);
    });
  }
);

app.listen(3001, function() {
  console.log("Server is listening on port 3001");
});
