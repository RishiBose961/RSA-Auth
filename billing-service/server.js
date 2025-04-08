const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');

const publicKey = fs.readFileSync('public.key', 'utf8');
const app = express();
app.use(express.json());

mongoose.connect('mongodb://localhost/billing').then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));;

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.split(' ')[1];
  jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, payload) => {
    if (err) return res.sendStatus(403);
    req.user = payload;
    next();
  });
}

app.post('/charge', authenticateJWT, async (req, res) => {
  const { amount } = req.body;

  const transaction = new Transaction({
    userId: req.user.sub,
    amount,
    status: 'success',
  });

  await transaction.save();

  res.json({ message: 'Charge successful', transaction });
});

app.listen(4002, () => console.log('Billing Service running on port 4002'));
