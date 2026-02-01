const NodeCache = require('node-cache');

// stdTTL: 1 hour, checkperiod: 10 minutes
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

/**
 * Cache Service wrapper to handle key-value operations
 */
const cacheService = {
  get: (key) => {
    return cache.get(key);
  },

  set: (key, value, ttl) => {
    // Optional: allow overriding the default TTL for specific calls
    return cache.set(key, value, ttl);
  },

  // Generate a standardized key for movie queries
  generateKey: (zip, date, radius, days) => {
    return `movies_${zip}_${date}_${radius || 10}_${days || 1}`;
  },

  getStats: () => cache.getStats(),

  flush: () => cache.flushAll()
};

module.exports = cacheService;
