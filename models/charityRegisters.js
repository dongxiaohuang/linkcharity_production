const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const deepPopulate = require('mongoose-deep-populate')(mongoose);
var passportLocalMongoose = require('passport-local-mongoose');

const charityRegisterSchema = new Schema({
     firstname: {
          type: String,
          default: ''
     },
     lastname: {
          type: String,
          default: ''
     },
     charity:{
          type: Schema.Types.ObjectId,
          ref:'Charity'
     },
     type:{
          type: String,
          default:'Charity User'
     }
});
// //// it will automatically add username and salt-encrypted psw for model
// // provide authenticate() as a local strategy
charityRegisterSchema.plugin(passportLocalMongoose);
charityRegisterSchema.plugin(deepPopulate);

module.exports = mongoose.model('CharityRegister',charityRegisterSchema);
