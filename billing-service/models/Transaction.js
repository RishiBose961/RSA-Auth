const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: String,
  amount: Number,
  status: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
