const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    srno: { type: Number, required: true }, // Add this line
    FullName: { type: String, required: true },
    Age: { type: Number, required: true },
    Sex: { type: String, required: true },
    CardNo: { type: String, required: true },
    Boot: { type: String, required: true },
    MobileNumber: { type: String },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
