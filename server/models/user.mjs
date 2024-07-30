import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const user = new Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    username: {type: String, required: true, unique: true},
    name: {type: String},
    role: {type: String, required: true, enum: ['admin', 'user'], default: 'user'},
    accountType: {type: String, required: true, enum: ['google', 'local'], default: 'local'},
    accountStatus: {type: String, required: true, enum: ['active', 'inactive'], default: 'active'},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    // isDeleted: { type: Boolean, default: false } // soft delete
});

const User = mongoose.model('User', user);

export default User;
