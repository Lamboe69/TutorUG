/**
 * Cache Warmer Job
 * Pre-warm Redis cache with common subjects and topics.
 */

const cron = require('node-cron');
const { getJSON, setJSON, DEFAULT_TTLS } = require('../services/cacheService');
const { Subject, Topic } = require('../models');

async function warmCache() {
  try {
    // Cache all subjects
    const subjects = await Subject.findAll();
    for (const subject of subjects) {
      await setJSON(`subject:${subject.id}`, subject.toJSON(), DEFAULT_TTLS.subjects);
    }

    // Cache popular topics
    const topics = await Topic.findAll({ limit: 100 });
    for (const topic of topics) {
      await setJSON(`topic:${topic.id}`, topic.toJSON(), DEFAULT_TTLS.topics);
    }

    console.log(`🔥 Warmed cache: ${subjects.length} subjects, ${topics.length} topics`);
  } catch (err) {
    console.error('Cache warmer job error:', err);
  }
}

// Run every 12 hours
function scheduleCacheWarmer() {
  cron.schedule('0 */12 * * *', warmCache);
  console.log('✅ Cache warmer job scheduled');
}

module.exports = { scheduleCacheWarmer, warmCache };
