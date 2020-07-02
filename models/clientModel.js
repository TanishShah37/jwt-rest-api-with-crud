const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const action = new Schema({
    type: {
        type: String
    },
    amount: {
        type: Number
    },
}, {
    timestamps: true
});


const clientSchema = new Schema({
    agencyId: {
        type: Schema.Types.ObjectId,
        ref: 'agency',
        required: true
    },
    name: {
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
        unique: false
    },
    totalBill: {
        type: Number,
        required: true
    },
    actions: [
        action
    ]
}, {
    timestamps: true
});


clientModel = mongoose.model('clientModel', clientSchema, 'client');

module.exports = clientModel;
