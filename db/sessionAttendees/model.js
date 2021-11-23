/**
 * name : models/sessionAttendees/schema
 * author : Aman Karki
 * Date : 07-Oct-2021
 * Description : Session Attendees schema data
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

let sessionAttendeesSchema = new Schema({
  sessionId: {
    type: ObjectId,
    index: true
  },
  status : {
    type: String,
    index: true
  },
  enrolledOn: Date,
  joinedAt: Date,
  leftAt: Date,
  userId: {
    type: String,
    index: true
  },
  link: String
});

const SessionAttendes = db.model("sessionAttendees",sessionAttendeesSchema);
module.exports = SessionAttendes;