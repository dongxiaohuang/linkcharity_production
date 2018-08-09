const mongoose = require('mongoose');
const mongooseAlgolia = require('mongoose-algolia');
const Schema = mongoose.Schema;

const donationSchema = new Schema({
     user: {
          type: Schema.Types.ObjectId,
          ref:'User',
     },
     charity:{
          type: Schema.Types.ObjectId,
          ref: 'Charity',
          requierd:true
     },
     amount:{
          type: Number,
          required:true
     },
     message:{
          type:String,
          default:''
     }
},{
     timestamps:true
})

module.exports = mongoose.model('Donation', donationSchema);
