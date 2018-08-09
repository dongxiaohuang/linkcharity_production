const Categories = require('../models/categories');
const Charities = require('../models/charities');
const express = require('express');
const categoriesRouter = express.Router();
const bodyParser = require('body-parser');
const cors = require('./cors');
const async = require('async');

categoriesRouter.use(bodyParser.json());

categoriesRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200);})
//TODO: admin check
.get(cors.cors, (req, res, next) => {
     Categories.find({})
          .then((categories) => {
               res.statusCode = 200;
               res.setHeader('Content-Type', 'application/json');
               res.json({
                    success: true,
                    message: "Success",
                    categories: categories
               })
          }, err=> next(err))
          .catch(err => next(err))
})
.post(cors.corsWithOptions, (req, res, next) => {
     Categories.create(req.body)
          .then((category) => {
               res.statusCode = 200;
               res.setHeader('Content-Type', 'application/json');
               res.json({
                    success: true,
                    message: "Success create category",
                    categories: category
               })
          }, err => next(err))
          .catch(err => next(err));
})
.put(cors.corsWithOptions, (req, res, next) => {
     res.statusCode = 403;
     res.end('PUT is not supported on endpoint /categories');
})
.delete(cors.corsWithOptions, (req, res, next) => {
     Categories.remove({})
          .then(resp => {
               res.statusCode = 200;
               res.setHeader('Content-Type', 'application/json');
               res.json({
                    success: true,
                    message: "Success remove categories",
                    result: resp
               })
          }, err => next(err))
          .catch(err => next(err))
})

categoriesRouter.route('/:id')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200);})
.get(cors.cors, (req, res, next) => {
     const perPage = 10;
     const page = req.query.page;
     async.parallel([
          function(callback){
               Charities.count({categories:req.params.id}, (err, count) => {
                    var totalCharities = count;
                    callback(err, totalCharities);
               })
          },
          function(callback){
               Charities.find({categories:req.params.id})
               .skip(perPage* page)
               .limit(perPage)
               .populate('categories')
               .exec((err, charities) => {
                    if(err) return next(err);
                    callback(err, charities);
               })
          },
          function(callback) {
               Categories.findOne({ _id: req.params.id}, (err, category) => {
               callback(err, category)
               });}
     ], (err, results) => {
          var totalCharities = results[0];
          var charities = results[1];
          var category = results[2];
          res.json({
               success:true,
               message:'category',
               charities:charities,
               categoryName: category.name,
               totalNumber: totalCharities,
               page: Math.ceil(totalCharities / perPage),
               numberPerPage: perPage
          })
     })

})
module.exports = categoriesRouter;
