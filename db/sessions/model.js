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
  date: String,
  time: String,
  duration: Number,
  recommendedFor: Array,
  categories: Array,
  medium: Array,
  image: Array,
  userId: {
    type: String,
    index: true
  },
  mentorName: String,
  sessionReschedule: Number,
  status : {
    type: String,
    index: true,
    default: "published"
  },
  deleted: {
    type: Boolean,
    default: false
  },
  startDateTime: String,
  endDateTime: String,
  startSessionTime: String,
  endSessionTime: String,
  shareLink: String
});

const Sessions = db.model("sessions",sessionsSchema);
module.exports = Sessions;