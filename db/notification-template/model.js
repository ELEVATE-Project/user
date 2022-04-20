/**
 * name : db/users/model
 * author : Aman Gupta
 * Date : 06-Dec-2021
 * Description : Template notification model
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationTemplateSchema = new Schema({
    type: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    subject: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    deleted: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        required: true,
        index: true
    },
    updatedBy: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    emailHeader:{
        type: String
    },
    emailFooter:{
        type: String
    }
});

const Users = db.model('notificationTemplates', notificationTemplateSchema,"notificationTemplates");

module.exports = Users;