const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const coverPicSchema = new Schema({
     url:{
          type: String,
          requierd: true
     },
     label:{
          type: String,
          required: true
     },
     description:{
          type:String,
          required: true
     }
},{
     timestamps: true
});

var CoverPics = mongoose.model('CoverPic', coverPicSchema);
module.exports = CoverPics;
