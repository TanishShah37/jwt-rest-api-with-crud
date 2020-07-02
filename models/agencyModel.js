
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const agencySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    address1: {
        type: String,
        required: true
    },
    address2: {
        type: String,
        default: ''
    },
    state: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
}, {
    timestamps: true
});

agencyModel = mongoose.model('agencyModel', agencySchema, 'agency')

module.exports = agencyModel;