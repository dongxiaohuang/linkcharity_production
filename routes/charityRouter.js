const express = require('express');
const bodyParser = require('body-parser');
const async = require('async');
const Charities = require('../models/charities');
const cors = require('./cors');
var charityAuthenticate = require('../charityAuthenticate');
var authenticate = require('../authenticate');
const charityRouter = express.Router();

charityRouter.use(bodyParser.json());

charityRouter.route('/')
     .options(cors.corsWithOptions, (req, res) => {
          res.sendStatus(200);
     })
     .get(cors.cors, (req, res, next) => {
          var perPage = 10;
          var page = req.query.page;
          async.parallel([
               function(callback) {
                    Charities.count({}, (err, count) => {
                         callback(err, count);
                    })
               },
               function(callback) {
                    Charities.find({})
                         .limit(perPage)
                         .skip(perPage * page)
                         .populate('categories')
                         .exec((err, charities) => {
                              if (err) return next(err);
                              callback(err, charities);
                         })
               }
          ], (err, results) => {
               var totalNumber = results[0];
               var charities = results[1];
               res.statusCode = 200;
               res.setHeader('Content-Type', 'application/json');
               res.json({
                    success: true,
                    message: 'charities',
                    charities: charities,
                    totalNumber: totalNumber,
                    page: Math.ceil(totalNumber / perPage),
                    numberPerPage: perPage
               }), (err) => next(err)
          })
     })
     .post(cors.corsWithOptions, (req, res, next) => {
          Charities.create(req.body)
               .then((charity) => {
                    console.log("Charity created: ", charity);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(charity);
               }, (err) => next(err))
               .catch(err => next(err));
     })
     .put(cors.corsWithOptions, charityAuthenticate.verifyUser, (req, res, next) => {
          res.statusCode = 403;
          res.end('PUT is not supported on endpoint /charities');
     })
     .delete(cors.corsWithOptions, charityAuthenticate.verifyUser, (req, res, next) => {
          Charities.remove({})
               .then((resp) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(resp);
               }, (err) => next(err))
               .catch(err => next(err));
     });

charityRouter.route('/allcharities')
.options(cors.corsWithOptions, (req, res) => {
     res.sendStatus(200);
})
.get(cors.cors, (req, res, next) => {
     Charities.find({})
     .then((charities) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(charities);
     }, err => next(err))
     .catch(err => next(err));
})
.post(cors.corsWithOptions, charityAuthenticate.verifyUser, (req, res, next) => {
     res.statusCode = 403;
     res.end('POST is not supported in this endpoint /allcharities' + req.params.charityId);
})
.put(cors.corsWithOptions, charityAuthenticate.verifyUser, (req, res, next) => {
     res.statusCode = 403;
     res.end('PUT is not supported in this endpoint /allcharities' + req.params.charityId);
})
.delete(cors.corsWithOptions, charityAuthenticate.verifyUser, (req, res, next) => {
     res.statusCode = 403;
     res.end('DELETE is not supported in this endpoint /allcharities' + req.params.charityId);
})
charityRouter.route('/newCharities')
     .options(cors.corsWithOptions, (req, res) => {
          res.sendStatus(200);
     })
     .get(cors.cors, (req, res, next) => {
          Charities.find({})
               .sort({
                    updatedAt: 'desc'
               })
               .limit(8)
               .populate('categories')
               .then((charities) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(charities);
               }, err => next(err))
               .catch(err => next(err));
     });
charityRouter.route('/:charityId')
     .options(cors.corsWithOptions, (req, res) => {
          res.sendStatus(200);
     })
     .get(cors.cors, (req, res, next) => {
          Charities.findById(req.params.charityId)
               .populate('comments.author')
               .populate('categories')
               .then((charity) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(charity);
               }, err => next(err))
               .catch(err => next(err));
     })
     .post(cors.corsWithOptions, charityAuthenticate.verifyUser, (req, res, next) => {
          res.statusCode = 403;
          res.end('POST is not supported in this endpoint /charities' + req.params.charityId);
     })
     .put(cors.corsWithOptions, charityAuthenticate.verifyUser, (req, res, next) => {
          Charities.findByIdAndUpdate(req.params.charityId, {
                    $set: req.body
               }, {
                    new: true
               })
               .then((charity) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(charity);
               }, (err) => next(err))
               .catch((err) => next(err));
     })
     .delete(cors.corsWithOptions, charityAuthenticate.verifyUser, (req, res, next) => {
          Charities.findByIdAndRemove(req.params.charityId)
               .then((resp) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(resp);
               }, (err) => next(err))
               .catch(err => next(err));
     });

charityRouter.route('/:charityId/geocode')
.options(cors.corsWithOptions, (req, res) => {
     res.sendStatus(200);
})
.get(cors.cors, (req, res, next) => {
     Charities.findById(req.params.charityId)
     .then((charity) => {
          if (charity != null) {
               res.statusCode = 200;
               res.setHeader('Content-Type', 'application/json');
               res.json(charity.geocoding);
          } else {
               var err = new Error('Charity' + req.params.charityId + ' not found!');
               err.status = 404;
               return next(err);
          }
     }, err => next(err))
     .catch(err => next(err));
})
.post(cors.corsWithOptions, (req, res, next) => {
     Charities.findById(req.params.charityId)
          .then((charity) => {
               charity.geocoding = req.body;
               charity.save()
               .then((charity) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(charity.geocoding);
               })
          }, err => next(err))
          .catch(err => next(err));
})
.put(cors.corsWithOptions, (req, res, next) => {
     Charities.findById(req.params.charityId)
          .then((charity) => {
               charity.geocoding = req.body;
               charity.save()
               .then((charity) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(charity.geocoding);
               })
          }, err => next(err))
          .catch(err => next(err));
})


charityRouter.route('/:charityId/comments')
     .options(cors.corsWithOptions, (req, res) => {
          sendStatus(200);
     })
     .get(cors.cors, (req, res, next) => {
          Charities.findById(req.params.charityId)
               .populate('comments.author')
               .then((charity) => {
                    if (charity != null) {
                         res.statusCode = 200;
                         res.setHeader('Content-Type', 'application/json');
                         res.json(charity.comments);
                    } else {
                         var err = new Error('Charity' + req.params.charityId + ' not found!');
                         err.status = 404;
                         return next(err);
                    }
               }, err => next(err))
               .catch(err => next(err));
     })
     .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
          Charities.findById(req.params.charityId)
               .then((charity) => {
                    if (charity != null) {
                         req.body.author = req.user._id;
                         charity.comments.push(req.body);
                         charity.save()
                              .then(charity => {
                                   Charities.findById(charity._id)
                                        .populate('comments.author')
                                        .then((charity) => {
                                             res.statusCode = 200;
                                             res.setHeader('Content-Type', 'application/json');
                                             res.json(charity.comments);
                                        })
                              })
                    }
               }, err => next(err))
               .catch(err => next(err));
     })
     .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
          res.statusCode = 403;
          res.end(req.method + 'operation is not supported on /dishes' + req.params.dishID + '/comments');
     })
     .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
          Charities.findById(req.params.charityId)
               .then((charity) => {
                    if (charity != null) {
                         //          for(var i=dish.comments.length-1; i >= 0; i--){
                         // // we cannot start from zero to delete must detere from the last
                         //
                         // //Each subdocument has an _id by default.
                         // //Mongoose document arrays have a special id method for
                         // //searching a document array to find a document with a given _id.
                         // //var doc = parent.children.id(_id);
                         // dish.comments.id(dish.comments[i]).remove();// embeded documents
                         charity.comments = [];
                         charity.save()
                              .then((charity) => {
                                   res.statusCode = 200;
                                   res.setHeader('Content-Type', 'application/json');
                                   res.json(charity.comments);
                              })
                    } else {
                         var err = new Error('charity' + req.params.charityId + ' not found');
                         err.status = 404;
                         next(err);
                    }
               }, err => next(err))
               .catch(err => next(err));
     })

module.exports = charityRouter;
