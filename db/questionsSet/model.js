/**
 * name : db/questions/model
 * author : Rakesh Kumar
 * Date : 30-Nov-2021
 * Description : Questions schema
 */

 const mongoose = require('mongoose');
const { feedback } = require('../../services/helper/sessions');
 const Schema = mongoose.Schema;
 
 const questionsSetSchema = new Schema({
    questions: {
         type: Array,
         required: true
     },
     code: {
        type: String,
        required: true,
        unique:true
     },
     deleted : {
        type: Boolean,
        default: false
     },
     status:{
      type: String,
      default:"published"
     }
 });
 
 const QuestionsSet = db.model("questionSet", questionsSetSchema,"questionSet");
 
 module.exports = QuestionsSet;    

 skippedFeedback:true/false
 feedback:[]