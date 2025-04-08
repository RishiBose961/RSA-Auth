const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const User = require('./models/User');

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost/auth').then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Load and decode RSA private key from environment
if (!process.env.PRIVATE_KEY) {
  throw new Error('❌ PRIVATE_KEY not set in environment variables');
}
const privateKey = Buffer.from(process.env.PRIVATE_KEY, 'base64').toString('utf8');

// ✅ REGISTER endpoint
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: 'Username and password required' });

    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(409).json({ message: 'Username already taken' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ LOGIN endpoint
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: 'Username and password required' });

    const user = await User.findOne({ username });
    if (!user)
      return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { sub: user._id, username: user.username },
      privateKey,
      { algorithm: 'RS256', expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(4000, () => console.log('🚀 Auth Service running on http://localhost:4000'));
