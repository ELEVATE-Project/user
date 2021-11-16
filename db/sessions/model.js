/**
 * name : models/sessions/schema
 * author : Aman Karki
 * Date : 07-Oct-2021
 * Description : Sessions schema data
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let sessionsSchema = new Schema({
  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  recommendedFor: Array,
  categories: Array,
  medium: Array,
  image: Array,
  userId: {
    type: String,
    index: true
  },
  sessionReschedule: Number,
  status : {
    type: String,
    index: true
  }
});

const Sessions = db.model("sessions",sessionsSchema);
module.exports = Sessions;