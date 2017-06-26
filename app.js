var express = require("express");
var app = express();
var methodOverride = require("method-override");
var morgan = require("morgan");
var bodyParser = require("body-parser");
var passport = require("passport");
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var cors = require("cors");

var authRoutes = require('./routes/auth');
var typesRoutes = require('./routes/types');
var assetRoutes = require('./routes/assets');
var activitiesRoutes = require('./routes/activities');
var loginRequired = require('./routes/helpers');

if (process.env.NODE_ENV !== 'production') {
  require("dotenv").config();
  app.use(morgan("tiny"));
}

app.use(express.static(__dirname + "/public"));
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

app.use('/auth', authRoutes);
app.use('/types', loginRequired, typesRoutes);
app.use('/assets/:a_id/childassets', loginRequired, assetRoutes);
app.use('/users/:u_id/activities', loginRequired, activitiesRoutes);

app.listen(3001, function() {
  console.log("Server is listening on port 3001");
});

module.exports = app;
