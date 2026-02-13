const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');
const routes = require('./routes');
 
const app = express();
 
// Security
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS, credentials: true }));
 
// Rate limiting
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
app.use('/api/auth', authLimiter);
 
app.use(express.json({ limit: '10mb' }));
app.use('/api', routes);
app.use(errorHandler);
 
module.exports = app;
