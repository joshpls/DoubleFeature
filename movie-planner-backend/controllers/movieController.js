const axios = require('axios');
const cacheService = require('../services/cacheService');

exports.getShowtimes = async (req, res) => {
  const { startDate, zip, radius, numDays } = req.query;
  const API_KEY = process.env.TMS_API_KEY;

  if (!zip || !startDate) {
    return res.status(400).json({ error: 'Zip and StartDate are required' });
  }

  // Use the service to generate the key
  const cacheKey = cacheService.generateKey(zip, startDate, radius, numDays);
  
  // Try to get data from cache service
  const cachedData = cacheService.get(cacheKey);

  if (cachedData) {
    console.log(`Cache Hit: ${cacheKey}`);
    return res.json(cachedData);
  }

  try {
    const response = await axios.get('http://data.tmsapi.com/v1.1/movies/showings', {
      params: {
        startDate,
        zip,
        radius: radius || 10,
        numDays: numDays || 1,
        api_key: API_KEY
      }
    });

    // Save to cache via service
    cacheService.set(cacheKey, response.data);

    res.json(response.data);
  } catch (error) {
    console.error('TMS API Error:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch movie data from TMS' 
    });
  }
};

exports.getHealth = (req, res) => {
  const stats = cacheService.getStats();
  
  res.status(200).json({
    status: 'UP',
    uptime: process.uptime().toFixed(2) + ' seconds',
    timestamp: new Date().toISOString(),
    cache: {
      keys: stats.keys,
      hits: stats.hits,
      misses: stats.misses,
      hitRate: stats.keys > 0 ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(2) + '%' : '0%'
    }
  });
};