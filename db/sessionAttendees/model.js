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
  userId: {
    type: ObjectId,
    index: true,
    required: true
  },
  sessionId: {
    type: ObjectId,
    index: true,
    required: true
  },
  isSessionAttended: {
    type: Boolean,
    default: false
  },
  deleted: {
    type: Boolean,
    default: false
  },
  joinedAt: Date,
  leftAt: Date,
  userId: {
    type: String,
    index: true
  },
  link: String,
  ratings: [
    {
      qid: ObjectId,
      rating: Number,
      label: String
    }
  ]
});

const SessionAttendes = db.model("sessionAttendees", sessionAttendeesSchema);
module.exports = SessionAttendes;