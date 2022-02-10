
require('dotenv').config()
var express = require('express'),
  session = require('express-session'),
  passport = require('passport'),
  SpotifyStrategy = require('passport-spotify').Strategy,
  consolidate = require('consolidate');

require('dotenv').config();

var port = 3000;
var authCallbackPath = '/auth/spotify/secrets';


passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});


passport.use(
    new SpotifyStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: 'http://localhost:' + port + authCallbackPath,
      },
      function (accessToken, refreshToken, expires_in, profile, done) {
        
        process.nextTick(function () {
          return done(null, profile);
        });
      }
    )
  );

var app = express();


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(
  session({secret: 'keyboard cat', resave: true, saveUninitialized: true})
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/images'));


app.get('/', function (req, res) {
  res.render('login', {user: req.user});
});

app.get('/secrets', ensureAuthenticated, function (req, res) {
  res.render('secrets', {user: req.user});
});


app.get(
  '/auth/spotify',
  passport.authenticate('spotify', {
    scope: ['user-read-email', 'user-read-private','playlist-read-private','playlist-read-collaborative'],
    showDialog: true,
  })
);

// GET /auth/spotify/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request. If authentication fails, the user will be redirected back to the
//   login page. Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get(
  '/auth/spotify/secrets',
  passport.authenticate('spotify', {failureRedirect: '/'}),
  function (req, res) {
    res.redirect('/secrets');
  }
);



app.listen(port, function () {
  console.log('App is listening on port ' + port);
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed. Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
   res.redirect('/');
  
}





