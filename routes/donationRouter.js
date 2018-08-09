const express = require('express');
const bodyParser = require('body-parser');
const Donations = require('../models/donations');
const CharityRegisters = require('../models/charityRegisters');
const cors = require('./cors');
var authenticate = require('../authenticate');
var charityAuthenticate = require('../charityAuthenticate');
const donationRouter = express.Router();
var passport = require('passport');
const async = require('async');


donationRouter.use(bodyParser.json());

donationRouter.route('/')
     .options(cors.corsWithOptions, (req, res) => {
          res.sendStatus(200)
     })
     .get(cors.cors, charityAuthenticate.verifyUser, (req, res, next) => {
          var perPage = 10;
          var page = req.query.page;
          CharityRegisters.findById(req.user._id)
               .then(charityUser => {
                    async.parallel([
                         function(callback) {
                              Donations.count({
                                   charity: charityUser.charity
                              }, (err, count) => {
                                   callback(err, count);
                              })
                         },
                         function(callback) {
                              Donations.find({
                                        charity: charityUser.charity
                                   })
                                   .limit(perPage)
                                   .skip(perPage * page)
                                   .sort('-createdAt')
                                   .populate('user')
                                   .exec((err, donations) => {
                                        if (err) return next(err);
                                        callback(err, donations)
                                   })
                         },
                         function(callback) {
                              Donations.aggregate([{
                                   $match: {charity: charityUser.charity}
                              }, {
                                   $group: {
                                        _id: null,
                                        totalamount: {
                                             $sum: "$amount"
                                        }
                                   }
                              }], (err, result) => {
                                   if (err) return next(err);
                                   callback(err, result)
                              });
                         },
                    ], (err, results) => {
                         var totalNumber = results[0];
                         var donations = results[1];
                         var totalDonations = results[2];
                         res.statusCode = 200;
                         res.setHeader('Content-Type', 'application/json');
                         res.json({
                              success: true,
                              message: 'donations',
                              donations: donations,
                              totalNumber: totalNumber,
                              page: Math.ceil(totalNumber / perPage),
                              numberPerPage: perPage,
                              totalDonations: totalDonations
                         });
                         if (err) next(err);
                    })
               })
     })
     .post(cors.corsWithOptions, (req, res, next) => {
          // passport.authenticate('jwtPassportUser', {
          //      session: false
          // }, (err, user, info) => {
          //      if (err) return next(err);
          //      if (!user) {
          //           Donations.create(req.body)
          //           .then(result => {
          //                res.statusCode = 200;
          //                res.setHeader('Content-Type', 'application/json');
          //                res.json(result);
          //           }, err => next(err))
          //           .catch(err => next(err))
          //      } else {
          //           Donations.create({
          //                charity:req.body.charity,
          //                user:user._id,
          //                amount:req.body.amount
          //           })
          //           .then(result => {
          //                res.statusCode = 200;
          //                res.setHeader('Content-Type', 'application/json');
          //                res.json(result);
          //           }, err => next(err))
          //           .catch(err => next(err))
          //      }
          // })(req, res);
          res.statusCode = 403;
          res.end('POST is not supported on endpoint /donation');

     })
     .put(cors.corsWithOptions, (req, res, next) => {
          res.statusCode = 403;
          res.end('PUT is not supported on endpoint /donation');
     })
     .delete(cors.corsWithOptions, (req, res, next) => {
          res.statusCode = 403;
          res.end('DELETE is not supported on endpoint /donation');
     });

donationRouter.route('/user')
     .options(cors.corsWithOptions, (req, res) => {
          res.sendStatus(200);
     })
     .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
          var perPage = 10;
          var page = req.query.page;
          async.parallel([
               function(callback) {
                    Donations.count({
                         user: req.user._id
                    }, (err, count) => {
                         callback(err, count);
                    })
               },
               function(callback) {
                    Donations.find({
                              user: req.user._id
                         })
                         .limit(perPage)
                         .skip(perPage * page)
                         .sort('-createdAt')
                         .populate('charity')
                         .then(donations => callback(null, donations))
                         .catch(err => next(err))
               },
               function(callback) {
                    Donations.aggregate([{
                         $match: {user: req.user._id}
                    }, {
                         $group: {
                              _id: null,
                              totalamount: {
                                   $sum: "$amount"
                              }
                         }
                    }], (err, result) => {
                         if (err) return next(err);
                         callback(err, result)
                    });
               },
          ], (err, results) => {
               var totalNumber = results[0];
               var donations = results[1];
               var totalDonations = results[2];
               res.statusCode = 200;
               res.setHeader('Content-Type', 'application/json');
               res.json({
                    success: true,
                    message: 'donations',
                    donations: donations,
                    totalNumber: totalNumber,
                    page: Math.ceil(totalNumber / perPage),
                    numberPerPage: perPage,
                    totalDonations: totalDonations
               });
               if (err) next(err);
          })
     })
     .post(cors.corsWithOptions, (req, res, next) => {
          res.statusCode = 403;
          res.end('POST is not supported on endpoint /donation');
     })
     .put(cors.corsWithOptions, (req, res, next) => {
          res.statusCode = 403;
          res.end('PUT is not supported on endpoint /donation');
     })
     .delete(cors.corsWithOptions, (req, res, next) => {
          res.statusCode = 403;
          res.end('DELETE is not supported on endpoint /donation');
     });


module.exports = donationRouter;
