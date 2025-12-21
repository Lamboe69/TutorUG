const redisClient = require('../config/redis');

const DEFAULT_TTLS = {
  aiResponse: 3600, // 1 hour
  subjects: 86400, // 24 hours
  topics: 43200, // 12 hours
  userProgress: 300, // 5 minutes
};

async function get(key) {
  return await redisClient.get(key);
}

async function getJSON(key) {
  const raw = await get(key);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

async function setJSON(key, value, ttl = DEFAULT_TTLS.aiResponse) {
  const str = JSON.stringify(value);
  if (ttl) {
    return await redisClient.setEx(key, ttl, str);
  }
  return await redisClient.set(key, str);
}

async function del(key) {
  return await redisClient.del(key);
}

module.exports = { DEFAULT_TTLS, get, getJSON, setJSON, del };
