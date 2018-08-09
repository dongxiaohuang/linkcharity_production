const express = require('express');
const bodyParser = require('body-parser');

const Favorites = require('../models/favorites');
const cors = require('./cors');
var authenticate = require('../authenticate');
const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
     .options(cors.corsWithOptions, (req, res) => {
          res.sendStatus(200);
     })
     .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
          Favorites.findOne({
                    user: req.user._id
               })
               .populate('charities') // TODO: if needed
               .deepPopulate(['charities.categories'])
               .then((favorites) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
               }, (err) => next(err))
               .catch(err => next(err));
     })
     .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'text/html');
          res.end(req.method + " not supported!");
     })
     .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'text/html');
          res.end(req.method + " not supported!");
     })
     .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
          Favorites.findOne({
                    user: req.user._id
               })
               .then(fav => {
                    fav.charities = []
                         .save()
                         .then(resp => {
                              Favorites.findById(resp._id)
                                   .populate('user')
                                   .populate('charities')
                                   .then(fav => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(fav);
                                   })
                         })
               }, err => next(err))
               .catch(err => next(err));
     });

favoriteRouter.route('/:charityID')
     .options(cors.corsWithOptions, (req, res, next) => {
          res.sendStatus(200);
     })
     .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
          Favorites.findOne({
                    user: req.user._id
               })
               .then((fav) => {
                    if (!fav) {
                         res.statusCode = 200;
                         res.setHeader('Content-Type', 'application/json');
                         return res.json({
                              "exists": false,
                              "favorites": fav
                         });
                    } else {
                         if (fav.charities.indexOf(req.params.charityID) < 0) {
                              res.statusCode = 200;
                              res.setHeader('Content-Type', 'application/json');
                              return res.json({
                                   "exists": false,
                                   "favorites": fav
                              });
                         } else {
                              res.statusCode = 200;
                              res.setHeader('Content-Type', 'application/json');
                              return res.json({
                                   "exists": true,
                                   "favorites": fav
                              });
                         }
                    }
               }, err => next(err))
               .catch(err => next(err))
     })
     .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
          Favorites.findOne({
                    user: req.user._id
               })
               .then((fav) => {
                    if (fav == null) {
                         Favorites.create({
                                   user: req.user._id,
                                   charities: [req.params.charityID]
                              })
                              .then(fav => {
                                   Favorites.findById(fav._id)
                                        // .populate('user')
                                        // .populate('charities')
                                        .then((favs) => {
                                             res.statusCode = 200;
                                             res.setHeader('Content-Type', 'application/json');
                                             res.json(favs);
                                        })
                              })
                    } else {
                         let idx = fav.charities.indexOf(req.params.charityID);
                         if (idx == -1) {
                              fav.charities.push(req.params.charityID);
                              fav.save()
                                   .then((favs) => {
                                        Favorites.findById(favs._id)
                                             .populate('user')
                                             .populate('charities')
                                             .then((fav) => {
                                                  res.statusCode = 200;
                                                  res.setHeader('Content-Type', 'application/json');
                                                  res.json(fav);
                                             })
                                   })
                         }else{
                              res.statusCode = 200;
                              res.setHeader('Content-Type', 'application/json');
                              res.json(fav);
                         }
                    }
               }, err => next(err))
               .catch(err => next(err))
     })
     .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'text/html');
          res.end(req.method + " not supported!");
     })
     .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
          Favorites.findOne({
                    user: req.user._id
               })
               .then((favs) => {
                    let idx = favs.charities.indexOf(req.params.charityID);
                    if (idx !== -1) {
                         favs.charities.splice(idx, 1);
                    };
                    favs.save()
                         .then(favs => {
                              Favorites.findById(favs._id)
                                   // .populate('user')
                                   // .populate('charities')
                                   .then(fav => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(fav);
                                   })
                         })
               }, err => next(err))
               .catch(err => next(err));
     });
module.exports = favoriteRouter;
