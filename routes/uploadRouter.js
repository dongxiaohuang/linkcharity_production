const express = require('express');
const bodyParser = require('body-parser');
const uploadRouter = express.Router();
const authenticate = require('../authenticate');
const multer = require('multer');
const cors = require('./cors');
//multer config
const storage = multer.diskStorage({
     destination: (req, file, callback) => {
          // err ; destination
          callback(null, 'public/images/userprofile'); //TODO: change
     },
     filename: (req, file, callback) => {
          //err; filename stored in our server
          callback(null, req.user._id+file.originalname)
     }
});
const storageCharity = multer.diskStorage({
     destination: (req, file, callback) => {
          // err ; destination
          callback(null, 'public/images/charityPics'); //TODO: change
     },
     filename: (req, file, callback) => {
          //err; filename stored in our server
          callback(null, file.originalname)
     }
});

const imageFileFilter =(req, file, callback) => {
     // regular express only accept jpg jpeg png gif
     if(!file.originalname.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)){
          return callback(new Error("you can upload only image files!"), false);
     }
     callback(null, true);
};

const upload = multer({storage:storage, fileFilter: imageFileFilter});
const uploadCharity = multer({storage:storageCharity, fileFilter: imageFileFilter})
uploadRouter.use(bodyParser.json());

uploadRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { sendStatus(200);})
.get(cors.cors, (req, res, next) => {
     res.statusCode = 403;
     res.end('GET is not supported on endpoint /upload');
})
//corresponding to the name of the name('imageFile') of input
// error handled by upload
.post(cors.corsWithOptions, authenticate.verifyUser, upload.single('imageFile'),(req, res) => {
     res.statusCode = 200;
     res.setHeader('Content-Type', 'application/json');
     res.json(req.file); // multer will provide file for us for single upoload
})
.put(cors.cors, authenticate.verifyUser, (req, res, next) => {
     res.statusCode = 403;
     res.end('PUT is not supported on endpoint /upload');
})
.delete();

uploadRouter.route('/charitiesPics')
.options(cors.corsWithOptions, (req, res) => { sendStatus(200);})
.post(cors.corsWithOptions, uploadCharity.array('imageFile',3),(req, res) => {
     res.statusCode = 200;
     res.setHeader('Content-Type', 'application/json');
     res.json(req.files); // multer will provide file for us for array upoload
})

module.exports = uploadRouter;
