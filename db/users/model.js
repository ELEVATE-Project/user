/**
 * name : models/account/schema
 * author : Aman Karki
 * Date : 07-Oct-2021
 * Description : Account schema data
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    address: {
      type: String,
      index: true
    },
    verified: {
      type: Boolean,
      default: false
    }
  },
  password: String,
  name: String,
  gender: String,
  designation: [String],
  location: String,
  languagePreferences: String,
  about: String,
  areasOfExpertise: [{ value: Number, label: String }],
  dateOfBirth: Date,
  photo: String,
  status: String,
  signedUpAt: Date,
  lastLoggedInAt: Date,
  isAMentor: {
    type: Boolean,
    default: false
  },
  resetPasswordLink: String,
  resetPasswordLinkExpiresIn: Date
});

const Users = db.model("users", userSchema);

module.exports = Users;