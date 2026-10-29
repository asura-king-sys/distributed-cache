const express = require('express');
const SimpleLRU = require('./cache');

function createServer(capacity = 100) {
  const app = express();
  app.use(express.json());

  const cache = new SimpleLRU(capacity);
  // Liveness probe. The coordinator in Step 3 uses this to detect dead nodes.
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', capacity: cache.capacity, size: cache.size() });
  });

  // Read a key
  app.get('/cache/:key', (req, res) => {
    const value = cache.get(req.params.key);
    if (value === undefined) {
      return res.status(404).json({ error: 'not found' });
    }
    res.json({ key: req.params.key, value });
  });

  // Write a key (optional ttl in milliseconds)
  app.put('/cache/:key', (req, res) => {
    const { value, ttl } = req.body;
    if (value === undefined) {
      return res.status(400).json({ error: 'value is required' });
    }
    cache.put(req.params.key, value, Number(ttl) || 0);
    res.status(201).json({ ok: true });
  });

  // Delete a key
  app.delete('/cache/:key', (req, res) => {
    const existed = cache.delete(req.params.key);
    res.status(existed ? 200 : 404).json({ deleted: existed });
  });

  // Debug endpoint: current size and capacity
  app.get('/stats', (req, res) => {
    res.json({ size: cache.size(), capacity: cache.capacity });
  });

  return app;
}

module.exports = createServer;