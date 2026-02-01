// src/routes/movieRoutes.js
const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const apiLimiter = require('../middleware/rateLimiter');

// Health Check Route
router.get('/health', movieController.getHealth);

// Apply rate limiter specifically to this route
router.get('/showtimes', apiLimiter, movieController.getShowtimes);

module.exports = router;
