/**
 * name : db/entities/model
 * author : Aman Gupta
 * Date : 04-Nov-2021
 * Description : Entity schema
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const entitySchema = new Schema({
    value: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'ACTIVE',
        required: true
    },
    deleted: {
        type: Boolean,
        default: false,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    updatedBy: {
        type: mongoose.Types.ObjectId,
        required: true
    }
});

const Entities = db.model("entities", entitySchema);

module.exports = Entities;