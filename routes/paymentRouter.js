const express = require('express');
const bodyParser = require('body-parser');
const async = require('async');
const cors = require('./cors');
const paymentRouter = express.Router();
const stripe = require('stripe')('sk_test_2nwposkyloGI8LEyP3FFZIlC');
const Donations = require('../models/donations');
var authenticate = require('../authenticate');
var passport = require('passport');

paymentRouter.route('/')
     .options(cors.corsWithOptions, (req, res) => {
          res.sendStatus(200);
     })
     .post(cors.corsWithOptions, (req, res, next) => {
          const stripeToken = req.body.stripeToken;
          const currentCharge = Math.round(req.body.amount * 100);

          stripe.customers
               .create({
                    source: stripeToken.id
               })
               .then(customer => {
                    return stripe.charges.create({
                         amount: currentCharge,
                         currency: 'gbp',
                         customer: customer.id
                    });
               })
               .then((charge) => {
                    // todo save
                    // console.log('charge period')
                    // res.statusCode = 200;
                    // res.setHeader('Content-type', 'application/json');
                    // res.json({
                    //      success: true,
                    //      message: "Successfully made a payment"
                    // })
                    passport.authenticate('jwtPassportUser', {
                         session: false
                    }, (err, user, info) => {
                         if (err) return next(err);
                         if (!user) {
                              Donations.create({
                                   charity:req.body.charity,
                                   amount:req.body.amount,
                                   message:req.body.message
                              })
                              .then(result => {
                                   res.statusCode = 200;
                                   res.setHeader('Content-Type', 'application/json');
                                   res.json({
                                        charge:charge,
                                        results:result
                                   });
                              }, err => next(err))
                              .catch(err => next(err))
                         } else {
                              Donations.create({
                                   charity:req.body.charity,
                                   user:user._id,
                                   amount:req.body.amount,
                                   message:req.body.message
                              })
                              .then(result => {
                                   res.statusCode = 200;
                                   res.setHeader('Content-Type', 'application/json');
                                   res.json({
                                        charge:charge,
                                        results:result
                                   });
                              }, err => next(err))
                              .catch(err => next(err))
                         }
                    })(req, res);
               })
     })

module.exports = paymentRouter;
