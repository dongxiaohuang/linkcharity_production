const express = require('express');
const coverPicRouter = express.Router();
const bodyParser = require('body-parser');
const CoverPics = require('../models/coverPics');
const cors = require('./cors');

coverPicRouter.use(bodyParser.json());

coverPicRouter.route('/')
     // preflight with options
     .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200);})
     .get(cors.cors, (req, res, next) => {
          CoverPics.find({})
               .then((pics) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(pics);
               }, (err) => next(err))
               .catch(err => next(err));
     })
     .post(cors.corsWithOptions, (req, res, next) => {
          CoverPics.create(req.body)
               .then((pic) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(pic)
               }, err => next(err))
               .catch(err => next(err));
     })
     .put(cors.corsWithOptions, (req, res, next) => {
          res.statusCode = 403;
          res.end('PUT is not supported on endpoint /covepics')
     })
     .delete(cors.corsWithOptions, (req, res, next) => {
          CoverPics.remove({})
               .then((resp) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(resp);
               }, err => next(err))
               .catch(err => next(err));
     });

coverPicRouter.route('/:id')
     .get(cors.cors, (req, res, next) => {
          CoverPics.findById(req.params.id)
               .then((pic) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(pic);
               }, err => next(err))
               .catch(err => next(err));
     })
     .post(cors.corsWithOptions, (req, res, next) => {
          res.statusCode = 403;
          res.end('POST is not avaliabel in this endpoint: /coverpics/'+req.params.id);
     })
     .put(cors.corsWithOptions, (req, res, next) => {
          CoverPics.findByIdAndUpdate(req.params.id, {
               $set: req.body
          }, { new: true})
               .then((pic) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(pic);
               }, err => next(err))
               .catch(err => next(err));
     })
     .delete(cors.corsWithOptions, (req, res, next) => {
          CoverPics.findByIdAndDelete(req.params.id)
               .then((resp) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(resp);
               }, err => next(err))
               .catch(err => next(err));
     });


module.exports = coverPicRouter;
