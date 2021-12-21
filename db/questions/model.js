/**
 * name : db/questions/model
 * author : Rakesh Kumar
 * Date : 30-Nov-2021
 * Description : Questions schema
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionsSchema = new Schema({

   name: {
      type: String
   },
   question: {
      type: String,
      required: true
   },
   options: {
      type: Array
   },
   type: {
      type: String
   },
   deleted: {
      type: Boolean,
      default: false
   },
   validators: {
      type: Object,
      default: { required: false }
   },
   value: {
      type: String
   },
   hint: {
      type: String
   },
   disable: {
      type: Boolean,
      default: false
   },
   visible: {
      type: Boolean,
      default: true
   },
   questionsSetId: {
      type: mongoose.Types.ObjectId
   },
   class: {
      type: String
   },
   noOfstars:{
      type: String
   },
   floating:{
      type: String
   },
   status:{
      type: String,
      default:"published"
   }
});

const Questions = db.model("questions", questionsSchema);

module.exports = Questions;