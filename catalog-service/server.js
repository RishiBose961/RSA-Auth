const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const publicKey = fs.readFileSync('public.key', 'utf8');
const app = express();

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
}

app.get('/products', authenticateJWT, (req, res) => {
  res.json({ message: 'Access granted to products', user: req.user });
});

app.listen(4001, () => console.log('Catalog Service running'));
