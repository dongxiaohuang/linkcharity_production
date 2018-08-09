var express = require('express');
var router = express.Router();
var cors = require('./cors')
const bodyParser = require('body-parser');
var User = require('../models/users');
var passport = require('passport');
var authenticate = require('../authenticate');

router.use(bodyParser.json());

router.route('/signup')
     .options(cors.corsWithOptions, (req, res) => {
          res.sendStatus(200);
     })
     .post(cors.corsWithOptions, (req, res, next) => {
          //passport mongoose support register method
          User.register(
               new User({
                    username: req.body.username
               }),
               req.body.password,
               (err, user) => {
                    if (err) {
                         res.statusCode = 500;
                         res.setHeader('Content-Type', 'application/json');
                         res.json({
                              err: err
                         });
                    } else {
                         //fill in the content of user model
                         if (req.body.firstname)
                              user.firstname = req.body.firstname;
                         if (req.body.lastname)
                              user.lastname = req.body.lastname;
                         if (req.body.country)
                              user.country = req.body.country;
                         user.save()
                              .then((user) => {
                                   // check if it is registered successfully
                                   passport.authenticate('localUser')(req, res, () => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json({
                                             status: "resgisteration successful!",
                                             success: true
                                        });
                                   });
                              }, (err) => next(err))
                              .catch(err => next(err));
                    }
               }
          )
     });
router.route('/login')
     .options(cors.corsWithOptions, (req, res) => {
          res.sendStatus(200);
     })
     //authenticate will automatically send error so we should only check req, res
     .post(cors.corsWithOptions, (req, res, next) => {
          // for more meaningful user login message
          // err: general request err
          // info: user err
          passport.authenticate('localUser', (err, user, info) => {
               if (err) return next(err);
               if (!user) {
                    res.statusCode = 401;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({
                         success: false,
                         status: 'Login Unsuccessful',
                         err: info
                    });
               }
               //try to Login
               req.logIn(user, (err) => {
                    if (err) {
                         res.statusCode = 401;
                         res.setHeader('Content-Type', 'application/jsom');
                         res.json({
                              success: false,
                              status: "Login Unsuccessful",
                              err: "Could not login user"
                         });
                    };

                    var token = authenticate.getToken({
                         _id: req.user._id
                    }); // passport will provide user in header
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({
                         status: "Login successful!",
                         token: token,
                         success: true
                    });
               })
          })(req, res, next);
          // res.json({success: true, token: token, status: "You are successfully logged in!"});
     });
router.route('/logout')
     .options(cors.corsWithOptions, (req, res) => {
          res.sendStatus(200);
     })
     //authenticate will automatically send error so we should only check req, res
     .get(cors.corsWithOptions, (req, res) => {
          req.logout();
          res.redirect('/');
     });
// check token valid or not
//it will keep alive of user login info
router.route('/checkJWTToken')
     .options(cors.corsWithOptions, (req, res) => {
          sendStatus(200);
     })
     .get(cors.corsWithOptions, (req, res) => {
          passport.authenticate('jwtPassportUser', {
               session: false
          }, (err, user, info) => {
               if (err) return next(err);
               if (!user) {
                    res.statusCode = 401;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({
                         status: 'JWT invalid',
                         success: false,
                         err: info

                    })
               } else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({
                         status: 'JWT valid',
                         success: true,
                         user: user
                    });
               }
          })(req, res);
     })

router.route('/profile')
     .options(cors.corsWithOptions, (req, res) => {
          sendStatus(200);
     })
     .get(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
          User.findById(req.user._id)
               .then(user => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(user);
               })
     })
     .post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
          res.statusCode = 403;
          res.end("POST is not supported on this endpoint");
     })
     .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
          let newVal = req.body;
          if(newVal.profile) newVal.profile = 'images/userprofile/'+req.user._id+req.body.profile;
          User.findByIdAndUpdate(req.user._id, {
                    $set: req.body
               }, {
                    new: true
               })
               .then(user => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(user);
               }, err => next(err))
               .catch(err => next(err));
     })
     .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
          res.statusCode = 403;
          res.end("DELETE is not supported on this endpoint");
     })
router.route('/newpassword')
     .options(cors.corsWithOptions, (req, res) => {
          res.sendStatus(200);
     })
     .get(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
          res.statusCode = 403;
          res.end("GET is not supported on this endpoint");
     })
     .post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
          res.statusCode = 403;
          res.end("POST is not supported on this endpoint");
     })
     .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
          User.findById(req.user._id).then(function(sanitizedUser) {
               if (sanitizedUser) {
                    sanitizedUser.setPassword(req.body.password, function() {
                         sanitizedUser.save();
                         res.status(200).json({
                              message: 'password reset successful'
                         });
                    });
               } else {
                    res.status(500).json({
                         message: 'This user does not exist'
                    });
               }
          }, function(err) {
               console.error(err);
          })
     })
     .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
          res.statusCode = 403;
          res.end("DELETE is not supported on this endpoint");
     })
router.route('/facebook/token')
.get(cors.cors, passport.authenticate('facebook-token'), (req, res) => {
     if(req.user) {
          var token = authenticate.getToken({_id: req.user._id});
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({
               success: true,
               token: token,
               status: "You are successful loggen in"
          })
     }
} )
module.exports = router;
