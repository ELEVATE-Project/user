/**
 * name : configs/mongodb
 * author : Aman
 * Date : 04-Nov-2021
 * Description : Mongodb connections configurations
*/

//dependencies
let mongoose = require("mongoose");
const mongoose_autopopulate = require("mongoose-autopopulate");
const mongoose_timestamp = require("mongoose-timestamp");
const mongoose_paginate = require('mongoose-paginate-v2');

module.exports = function() {
  
  // Added to remove depreciation warnings from logs.
  mongoose.set('useCreateIndex', true)
  mongoose.set('useFindAndModify', false)
  mongoose.set('useUnifiedTopology', true)
  
  var db = mongoose.createConnection(
    process.env.MONGODB_URL,
    {
      useNewUrlParser: true
    }
  );

  db.on("error", function () {
    console.log("connection error:")
  });

  db.once("open", function() {
    console.log("Connected to DB");
  });

  mongoose.plugin(mongoose_timestamp, {
      createdAt: "createdAt",
      updatedAt: "updatedAt"
  });
  
  mongoose.plugin(mongoose_autopopulate);
  mongoose.plugin(mongoose_paginate);
  global.db = db;
};
