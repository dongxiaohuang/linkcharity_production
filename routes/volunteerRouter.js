const express = require('express');
const bodyParser = require('body-parser');
const async = require('async');
const Volunteers = require('../models/volunteers');
const CharityRegisters = require('../models/charityRegisters');
const cors = require('./cors');
var charityAuthenticate = require('../charityAuthenticate');
var authenticate = require('../authenticate');
var moment = require('moment')

var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; //January is 0!
var yyyy = today.getFullYear();

const volunteerRouter = express.Router();

volunteerRouter.use(bodyParser.json());

volunteerRouter.route('/')
     .options(cors.corsWithOptions, (req, res) => {
          res.sendStatus(200);
     })
     .get(cors.cors, (req, res, next) => {
          var perPage = 10;
          var page = req.query.page;
          var year = req.query.year;
          var month = req.query.month;
          var day = req.query.day;
          async.parallel([
               (callback) => {
                    if (year||month||day) {
                         Volunteers.count({
                                   $and:[
                                        {'timeslots.date.year':year},
                                        {'timeslots.date.month':month},
                                        {'timeslots.date.day':day},
                                   ]
                              })
                              .then(res => {
                                   callback(null, res)
                              })
                              .catch(err => callback(err, null))
                    } else {
                         Volunteers.count({
                                   $or:[
                                        {
                                        'timeslots.date.year': {$gt:yyyy}
                                   },
                                   {
                                        $and:[
                                             {'timeslots.date.year':yyyy},
                                             {'timeslots.date.month':{$gt:mm}}
                                        ]
                                   },
                                   {
                                        $and:[
                                             {'timeslots.date.year':yyyy},
                                             {'timeslots.date.month':mm},
                                             {'timeslots.date.day':{$gte:dd}}
                                        ]
                                   }
                              ]
                              })
                              .then(res => {
                                   callback(null, res)
                              })
                              .catch(err => callback(err, null))
                    }
               },
               callback => {
                    if (year||month||day) {
                         Volunteers.find({
                                   $and:[
                                        {'timeslots.date.year':year},
                                        {'timeslots.date.month':month},
                                        {'timeslots.date.day':day},
                                   ]
                              })
                              .limit(perPage)
                              .skip(perPage * page)
                              .populate('charity')
                              .sort('-createAt')
                              .then((res) => callback(null, res))
                              .catch(err => callback(err, null))
                    } else {
                         console.log(yyyy, mm, dd)
                         Volunteers.find({
                                   $or:[
                                        {
                                        'timeslots.date.year': {$gt:yyyy}
                                   },
                                   {
                                        $and:[
                                             {'timeslots.date.year':yyyy},
                                             {'timeslots.date.month':{$gt:mm}}
                                        ]
                                   },
                                   {
                                        $and:[
                                             {'timeslots.date.year':yyyy},
                                             {'timeslots.date.month':mm},
                                             {'timeslots.date.day':{$gte:dd}}
                                        ]
                                   }
                              ]
                              })
                              .limit(perPage)
                              .skip(perPage * page)
                              .populate('charity')
                              .sort('-createAt')
                              .then((res) => callback(null, res))
                              .catch(err => callback(err, null))
                    }
               }
          ], (err, results) => {
               var totalNumber = results[0];
               var volunteers = results[1];
               res.statusCode = 200;
               res.setHeader('Content-Type', 'application/json');
               res.json({
                    success: true,
                    message: 'charities',
                    volunteers: volunteers,
                    totalNumber: totalNumber,
                    page: Math.ceil(totalNumber / perPage),
                    numberPerPage: perPage
               }), (err) => next(err)
          })
     })
     .post(cors.corsWithOptions, charityAuthenticate.verifyUser, (req, res, next) => {
          CharityRegisters.findById(req.user._id)
               .then(charityUser => {
                    let volunteer = req.body;
                    volunteer.charity = charityUser.charity;
                    Volunteers.create(volunteer)
                         .then(vol => {
                              res.statusCode = 200;
                              res.setHeader('Content-Type', 'application/json');
                              res.json(vol)
                         }, err => next(err))
                         .catch(err => next(err))
               }, err => next(err))
               .catch(err => next(err))
     })
     .put(cors.corsWithOptions, charityAuthenticate.verifyUser, (req, res, next) => {
          res.statusCode = 403;
          res.end('PUT is not supported in this endpoint /volunteer');
     })
     .delete(cors.corsWithOptions, charityAuthenticate.verifyUser, (req, res, next) => {
          res.statusCode = 403;
          res.end('DELETE is not supported in this endpoint /volunteer');
     })


volunteerRouter.route('/:volunteerId')
     .options(cors.corsWithOptions, (req, res) => {
          res.sendStatus(200);
     })
     .get(cors.cors, (req, res, next) => {
          Volunteers.findById(req.params.volunteerId)
               .populate('charity')
               .then(volunteer => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(volunteer)
               }, err => next(err))
               .catch(err => next(err))
     })
     .post(cors.corsWithOptions, charityAuthenticate.verifyUser, (req, res, next) => {
          res.statusCode = 403;
          res.end('POST is not supported in this endpoint /volunteer' + req.params.volunteerId);
     })
     .put(cors.corsWithOptions, charityAuthenticate.verifyUser, (req, res, next) => {
          Volunteers.findByIdAndUpdate(req.params.volunteerId, {
                    $set: req.body
               }, {
                    new: true
               })
               .then((volunteer) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(volunteer);
               }, (err) => next(err))
               .catch((err) => next(err));
     })
     .delete(cors.corsWithOptions, charityAuthenticate.verifyUser, (req, res, next) => {
          Volunteers.findByIdAndRemove(req.params.volunteerId)
               .then(resp => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(resp);
               }, (err) => next(err))
               .catch(err => next(err));
     })

volunteerRouter.route('/:volunteerId/timeslots')
     .options(cors.corsWithOptions, (req, res) => {
          res.sendStatus(200);
     })
     .get(cors.cors, (req, res, next) => {
          Volunteers.findById(req.params.volunteerId)
               .then(volunteer => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(volunteer.timeslots);
               }, err => next(err))
               .catch(err => next(err))
     })
     .post(cors.corsWithOptions, charityAuthenticate.verifyUser, (req, res, next) => {
          Volunteers.findById(req.params.volunteerId)
               .then(volunteer => {
                    volunteer.timeslots.push(req.body);
                    volunteer.save()
                         .then((volunteer) => {
                              res.statusCode = 200;
                              res.setHeader('Content-Type', 'application/json');
                              res.json(volunteer);
                         }, err => next(err))
               }, err => next(err))
               .catch(err => next(err))
     })
     .put(cors.corsWithOptions, charityAuthenticate.verifyUser, (req, res, next) => {
          res.statusCode = 403;
          res.end('PUT is not supported in this endpoint /volunteer' + req.params.volunteerId);
     })
     .delete(cors.corsWithOptions, charityAuthenticate.verifyUser, (req, res, next) => {
          Volunteers.findById(req.params.volunteerId)
               .then(volunteer => {
                    volunteer.timeslots = [];
                    volunteer.save()
                         .then((volunteer) => {
                              res.statusCode = 200;
                              res.setHeader('Content-Type', 'application/json');
                              res.json(volunteer);
                         }, err => next(err))
               }, err => next(err))
               .catch(err => next(err))
     })
volunteerRouter.route('/:volunteerId/timeslot/:timeslotId')
     .options(cors.corsWithOptions, (req, res) => {
          res.sendStatus(200);
     })
     .get(cors.cors, (req, res, next) => {
          Volunteers.findById(req.params.volunteerId)
               .then((volunteer) => {
                    if (volunteer != null && volunteer.timeslots.id(req.params.timeslotId) != null) {
                         res.statusCode = 200;
                         res.setHeader('Content-Type', 'application/json');
                         res.json(volunteer.timeslots.id(req.params.timeslotId));
                    } else if (volunteer == null) {
                         err = new Error('volunteer ' + req.params.volunteerId + ' not found');
                         err.status = 404;
                         return next(err);
                    } else {
                         err = new Error('Timeslot ' + req.params.timeslotId + ' not found');
                         err.status = 404;
                         return next(err);
                    }
               }, (err) => next(err))
               .catch((err) => next(err));
     })
     .post(cors.corsWithOptions, charityAuthenticate.verifyUser, (req, res, next) => {
          res.statusCode = 403;
          res.end('POST is not supported in this endpoint /volunteer' + req.params.volunteerId + '/timeslot/' + req.params.timeslotId);
     })
     .put(cors.corsWithOptions, charityAuthenticate.verifyUser, (req, res, next) => {
          Volunteers.findOneAndUpdate({
                    "_id": req.params.volunteerId,
                    "timeslots._id": req.params.timeslotId
               }, {
                    "$set": {
                         "timeslots.$": req.body
                    }
               }, {
                    new: true
               })
               .then(volunteer => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(volunteer.timeslots.id(req.params.timeslotId));
               }, err => next(err))
               .catch(err => next(err))
     })
     .delete(cors.corsWithOptions, charityAuthenticate.verifyUser, (req, res, next) => {
          Volunteers.findById(req.params.volunteerId)
               .then((volunteer) => {
                    if (volunteer != null && volunteer.timeslots.id(req.params.timeslotId) != null) {
                         volunteer.timeslots.id(req.params.timeslotId).remove(); // make sure Id is different
                         volunteer.save()
                              .then(volunteer => {
                                   res.statusCode = 200;
                                   res.setHeader('Content-Type', 'application/json');
                                   res.json(volunteer);
                              }, err => next(err))
                              .catch(err => next(err))
                    } else if (volunteer == null) {
                         err = new Error('volunteer ' + req.params.volunteerId + ' not found');
                         err.status = 404;
                         return next(err);
                    } else {
                         err = new Error('Timeslot ' + req.params.timeslotId + ' not found');
                         err.status = 404;
                         return next(err);
                    }
               }, (err) => next(err))
               .catch((err) => next(err));
     })

volunteerRouter.route('/charity/:charityId')
     .options(cors.corsWithOptions, (req, res) => {
          res.sendStatus(200);
     })
     .get(cors.cors, (req, res, next) => {
          var perPage = 10;
          var page = req.query.page;
          async.parallel([
               (callback) => {
                    Volunteers.count(
                         {$and:[{charity: req.params.charityId},
                              {$or:[
                                   {
                                        'timeslots.date.year': {$gt:yyyy}
                                   },
                                   {
                                        $and:[
                                             {'timeslots.date.year':yyyy},
                                             {'timeslots.date.month':{$gt:mm}}
                                        ]
                                   },
                                   {
                                        $and:[
                                             {'timeslots.date.year':yyyy},
                                             {'timeslots.date.month':mm},
                                             {'timeslots.date.day':{$gte:dd}}
                                        ]
                                   }
                              ]}
                         ]
                         }
                    )
                         .then(res => {
                              callback(null, res)
                         })
                         .catch(err => callback(err, null))
               },
               callback => {
                    Volunteers.find({$and:[{charity: req.params.charityId},
                         {$or:[
                              {
                                   'timeslots.date.year': {$gt:yyyy}
                              },
                              {
                                   $and:[
                                        {'timeslots.date.year':yyyy},
                                        {'timeslots.date.month':{$gt:mm}}
                                   ]
                              },
                              {
                                   $and:[
                                        {'timeslots.date.year':yyyy},
                                        {'timeslots.date.month':mm},
                                        {'timeslots.date.day':{$gte:dd}}
                                   ]
                              }
                         ]}
                    ]
                    })
                         .limit(perPage)
                         .skip(perPage * page)
                         .sort('-createAt')
                         .then((res) => callback(null, res))
                         .catch(err => callback(err, null))
               }
          ], (err, results) => {
               var totalNumber = results[0];
               var volunteers = results[1];
               res.statusCode = 200;
               res.setHeader('Content-Type', 'application/json');
               res.json({
                    success: true,
                    message: 'volunteer for ' + req.params.charityId,
                    volunteers: volunteers,
                    totalNumber: totalNumber,
                    page: Math.ceil(totalNumber / perPage),
                    numberPerPage: perPage
               }), (err) => next(err)
          })
     })
     .post(cors.corsWithOptions, charityAuthenticate.verifyUser, (req, res, next) => {
          res.statusCode = 403;
          res.end('POST is not supported in this endpoint /charity/' + req.params.charityId);
     })
     .put(cors.corsWithOptions, charityAuthenticate.verifyUser, (req, res, next) => {
          res.statusCode = 403;
          res.end('PUT is not supported in this endpoint /charity/' + req.params.charityId);
     })
     .delete(cors.corsWithOptions, charityAuthenticate.verifyUser, (req, res, next) => {
          res.statusCode = 403;
          res.end('DELETE is not supported in this endpoint /charity/' + req.params.charityId);
     })

module.exports = volunteerRouter;
