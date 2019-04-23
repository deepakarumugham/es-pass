var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db = require('./db');
const mongoose = require('mongoose');
require('./models/User');
require('./models/Blog');

const User = mongoose.model('User');


mongoose.connect("mongodb://admin:password@localhost:27017/RI", { useMongoClient: true });

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new Strategy(
  function(user, password, cb) {
    User.findOne({username: user}, function(err, user) {
      if (err) {
            console.error("Error while querying DB: " + err);
            return cb(err);
       }

      if (!user) {
            console.log("User not found");
            return cb(null, false);
      }
      if (user.password != password) {
            console.log("Password not matching");
            console.log("DB pass: " + user);
            return cb(null, false);
      }
      return cb(null, user);
    });
  }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
  console.log("Serializing User: " + user.id);
  cb(null, user.id);
});

passport.deserializeUser(function(userId, cb) {
  console.log("De-Serializing User: " + id);
  User.findOne({ id: userId },
    function (err, user) {
        if (err) { return cb(err); }
        cb(null, user);
  });
//  db.users.findById(id, function (err, user) {
//    if (err) { return cb(err); }
//    cb(null, user);
//  });
});




// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(function(req, res, next){
    console.log("Request Header:\n" + JSON.stringify(req.headers));
    console.log("Request Body:\n" + JSON.stringify(req.body));
    next();
});

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// Define routes.
app.get('/',
  function(req, res) {
    console.log("Home: " + req.user);
    res.render('home', { user: req.user });
  });

app.get('/login',
  function(req, res){
    res.render('login');
  });
  
app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });
  
app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });


app.listen(3000);
