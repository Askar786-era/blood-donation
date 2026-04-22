const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
    bloodGroup: { type: String, required: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    isOnline: { type: Boolean, default: false },
    socketId: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Donor', donorSchema);
