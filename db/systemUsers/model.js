/**
 * name : db/users/model
 * author : Aman Karki
 * Date : 10-Nov-2021
 * Description : System User schema data
 */

// Dependencies
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        address: {
            type: String,
            index: {
                unique: true
            },
            required: true
        },
        verified: {
            type: Boolean,
            default: false
        }
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    role: String
});

const SystemUsers = db.model("systemUsers", userSchema);

module.exports = SystemUsers;