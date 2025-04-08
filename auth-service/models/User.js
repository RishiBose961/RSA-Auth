const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String // You should hash passwords in production
});

module.exports = mongoose.model('User', userSchema);
