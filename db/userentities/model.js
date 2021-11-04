/**
 * name : db/userentities/model
 * author : Aman Gupta
 * Date : 04-Nov-2021
 * Description : User Entity schema
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userEntitySchema = new Schema({
    code: {
        type: String,
        required: true
    },
    name: {
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

const UserEntities = db.model("userEntities", userEntitySchema);

module.exports = UserEntities;