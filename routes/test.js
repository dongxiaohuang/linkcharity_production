var moment = require('moment');

var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; //January is 0!
var yyyy = today.getFullYear();

console.log(dd, mm, yyyy)
