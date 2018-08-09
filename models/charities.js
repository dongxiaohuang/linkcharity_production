const mongoose = require('mongoose');
const mongooseAlgolia = require('mongoose-algolia');
const config = require('../config');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
     rating: {
          type: Number,
          max: 5,
          min: 1,
          required: true
     },
     author: {
          type: Schema.Types.ObjectId,
          ref: 'User'
     },
     comment: {
          type: String,
          required: true
     }
}, {
     timestamps: true
});

const charitySchema = new Schema({
     ccn:{
          type: Number,
          default:''
     },
     rbody:{
          type: String,
          default:''
     },
     rno:{
          type:Number,
          default:''
     },
     name: {
          type: String,
          required: true,
     },
     tel:{
          type: String, //TODO:
          required: true
     },
     web:{
          type: String,
          default:''
     },
     email:{
          type: String,
          required: true
     },
     categories: [{
          type: Schema.Types.ObjectId,
          ref: 'Category',
          requierd:true
     }],
     images: {
          type: [String],
          required:true,
          default: ['images/people2.jpg']
     },
     info: {
          type: String,
          required: true
     },
     details:{
          type: String,
          required:true
     },
     postcode:{
          type: String,
          required:true
     },
     country: {
          type: String,
          requierd: true
     },
     state:{
          type:String,
          default: ''
     },
     city: {
          type: String,
          required: true
     },
     address: {
          line1: {
               type:String,
               default: ''},
          line2: {
               type:String,
               default: ''}
     },
     comments: [commentSchema] // TODO: changed to comments TypeID
     ,
     card:{
          type: Schema.Types.ObjectId,
          ref:'PaymentDtail',
          required:true
     },
     geocoding: {
          lat: Number,
          lng: Number
     }
},
 {
     timestamps: true,
     toObject: {
          virtuals: true
     },
     toJSON: {
          virtuals: true
     }
});

charitySchema
     .virtual('averageRating')
     .get(function(){ // cannot use arrow function
          var rating = 0;
          if (this.comments.length == 0)
               {rating = 0}
          else {
               this.comments.map((comment) => {
                    rating += comment.rating;
               });
               rating /= this.comments.length;
          }
          return rating;
     });
charitySchema
     .virtual('geoaddress')
     .get(function(){ // cannot use arrow function
          var state =this.state? this.state+ ', ' : '';
          var line = this.address.line2 ? this.address.line1+', '+this.address.line2 : this.address.line1;
          var addr = line +', '+this.city +', ' +state+this.postcode+', '+this.country;
          return addr;
     });

charitySchema
     .virtual('rateLen')
     .get(function(){ // cannot use arrow function
          return this.comments.length;
     });

//TODO: config to store keys
charitySchema.plugin(mongooseAlgolia, {
     appId: config.algolia.appId,
     apiKey: config.algolia.apiKey,
     indexName: config.algolia.indexName,
     selector: '_id name country city categories info averageRating images rateLen', //which you would like to asyn with algolia
     populate: {
          path: 'categories',
          select:'name'
     },
     // defaults: {},
     // mappings: {},
     // virtuals: {
     //      averageRating: function(doc){
     //           var rating = 0;
     //           if (doc.comments.length == 0)
     //                {rating = 0}
     //           else {
     //                doc.comments.map((comment) => {
     //                     rating += comment.rating;
     //                });
     //                rating /= doc.comments.length;
     //           }
     //           return rating;
     //      }
     // },
     debug: true
});

let Charities = mongoose.model('Charity', charitySchema);
Charities.SyncToAlgolia();
Charities.SetAlgoliaSettings({
     searchableAttributes: ['name', 'country', 'city', 'categories']
})


module.exports = Charities;
