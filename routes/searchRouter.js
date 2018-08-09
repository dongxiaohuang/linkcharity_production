const searchRouter = require('express').Router();
const algoliasearch = require('algoliasearch');
const config = require('../config');
// TODO: replace your algolia Key
const client = algoliasearch(config.algolia.appId, config.algolia.apiKey);
const index = client.initIndex(config.algolia.indexName);
const cors = require('./cors');

//TODO: implement all routes
// TODO: search labels;

searchRouter.route('/')
     .options(cors.corsWithOptions, (req, res) => {
          sendStatus(200);
     })
     .get(cors.cors, (req, res, next) => {
               if (req.query.query) {
                    index.search({
                              query: req.query.query,
                              page: req.query.page, //TODO
                              hitsPerPage: 10
                         })
                         .then((results) => {
                              res.statusCode = 200;
                              res.setHeader('Content-Type', 'application/json');
                              res.json({
                                   success: true,
                                   message: "Here is your search",
                                   search_key: req.query.query,
                                   search_result: results
                              })
                         })
                         .catch(err => next(err));
               }});

module.exports = searchRouter;
