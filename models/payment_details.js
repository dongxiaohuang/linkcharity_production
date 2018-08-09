const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentDtailSchema = new Schema({
     name:{
          type: String,
          required: true
     },
     number: {
          type: Number,
          requierd: true
     },
     sortcode:{
          type: Number,
          required:true
     },
     account_no:{
          type: Number,
          required: true
     },
     paypal:{
          type: Number
     }
})


module.exports = mongoose.model('PaymentDtail', paymentDtailSchema);
