const express = require('express');
const charityRegisterRouter = express.Router();
const bodyParser = require('body-parser');
const charityRegister = require('../models/charityRegisters');
const passport = require('passport');
const authenticate = require('../charityAuthenticate');
const cors = require('./cors');

charityRegisterRouter.use(bodyParser.json());

charityRegisterRouter.route('/signup')
     .options(cors.corsWithOptions, (req, res) => {
          res.sendStatus(200);
     })
     .post(cors.corsWithOptions, (req, res, next) => {
          charityRegister.register(
               new charityRegister({
                    username: req.body.username
               }), req.body.password,
               (err, charityUser) => {
                    if (err) {
                         res.statusCode = 500;
                         res.setHeader('Content-Type', 'application/json');
                         res.json({
                              success: false,
                              err: err
                         });
                    } else {
                         charityUser.firstname = req.body.firstname;
                         charityUser.lastname = req.body.lastname;
                         charityUser.charity = req.body.charity;
                         charityUser.save()
                              .then((charityUser) => {
                                   passport.authenticate('localCharity')(req, res, () => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json({
                                             status: "charityUser resgisteration successful!",
                                             success: true
                                        });
                                   })
                              }, err => next(err))
                              .catch(err => next(err))
                    }
               })
     });
charityRegisterRouter.route('/login')
     .options(cors.corsWithOptions, (req, res) => {
          res.sendStatus(200);
     })
     .post(cors.corsWithOptions, (req, res, next) => {
          passport.authenticate('localCharity', (err, user, info) => {
               if (err) return next(err);
               if (!user) {
                    res.statusCode = 401;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({
                         success: false,
                         status: 'Charity Login Unsuccessful',
                         err: info
                    });
               } else {
                    // try to logIn
                    req.logIn(user, (err) => {
                         if (err) {
                              res.statusCode = 401;
                              res.setHeader('Content-Type', 'application/jsom');
                              res.json({
                                   success: false,
                                   status: "Charity Login Unsuccessful",
                                   err: "Could not login user"
                              });
                         };
                         var token = authenticate.getToken({
                              _id: req.user._id
                         }); // passport will provide user in header
                         res.statusCode = 200;
                         res.setHeader('Content-Type', 'application/json');
                         res.json({
                              status: "Charity Login successful!",
                              token: token,
                              success: true
                         });
                    })
               }
          })(req, res, next);
     });
charityRegisterRouter.route('/logout')
     .options(cors.corsWithOptions, (req, res) => {
          res.sendStatus(200);
     })
     //authenticate will automatically send error so we should only check req, res
     .get(cors.corsWithOptions, (req, res) => {
          req.logout();
          res.redirect('/');
     });
charityRegisterRouter.route('/profile')
     .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200);})
     .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
          charityRegister.findById(req.user._id)
               .populate('charity')
               .deepPopulate(['charity.card','charity.categories'])
               .then((charityUser) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(charityUser);
               }, err => next(err))
               .catch(err => next(err))
     })
     .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
          res.statusCode = 403;
          res.end('POST is not supported on endpoint /charityuser/profile');
     })
     .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
          charityRegister.findByIdAndUpdate(req.user._id, {
               $set: req.body
          }, {
               new: true
          })
       .then(user => {
            res.statusCode = 200;
            res.setHeader('Content-type', 'application/json');
            res.json(user)
       }, err => next(err))
       .catch(err => next(err))})
     .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
          res.statusCode = 403;
          res.end('DELETE is not supported on endpoint /charityuser/profile');
     })

charityRegisterRouter.route('/newpassword')
     .options(cors.corsWithOptions, (req, res) => {
          res.sendStatus(200);
     })
     .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
          res.statusCode = 403;
          res.end('GET is not supported on endpoint /charityuser/profile');
     })
     .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
          res.statusCode = 403;
          res.end('POST is not supported on endpoint /charityuser/profile');
     })
     .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
          charityRegister.findById(req.user._id).then(function(sanitizedUser) {
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
     .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
          res.statusCode = 403;
          res.end('DELETE is not supported on endpoint /charityuser/profile');
     })
// check token valid or not
//it will keep alive of user login info
charityRegisterRouter.route('/checkJWTToken')
     .options(cors.corsWithOptions, (req, res) => {
          sendStatus(200);
     })
     .get(cors.corsWithOptions, (req, res) => {
          passport.authenticate('jwt', {
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

module.exports = charityRegisterRouter;
