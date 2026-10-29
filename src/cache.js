// src/cache.js

class SimpleLRU {
  /**
   * @param {number} capacity - maximum number of entries before eviction
   */
  constructor(capacity) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new Error('capacity must be a positive integer');
    }
    this.capacity = capacity;
    // Map preserves insertion order, which we exploit for LRU ordering.
    // The first key returned by keys() is the least recently used.
    this.map = new Map();
  }

  /**
   * Retrieve a value. Returns undefined if the key is missing or expired.
   * A successful get marks the key as most recently used.
   */
  get(key) {
    const entry = this.map.get(key);
    if (!entry) return undefined;

    // Lazy expiration: if the entry has expired, remove it and report a miss.
    if (entry.expiresAt !== Infinity && Date.now() > entry.expiresAt) {
      this.map.delete(key);
      return undefined;
    }

    // Move to the "most recently used" position by deleting and re-inserting.
    this.map.delete(key);
    this.map.set(key, entry);

    return entry.value;
  }

  /**
   * Insert or update a key.
   * @param {string} key
   * @param {*} value
   * @param {number} [ttlMs=0] - time to live in milliseconds; 0 means no expiry
   */
  put(key, value, ttlMs = 0) {
    // If the key already exists, remove it first so the re-insert
    // lands at the most-recently-used position.
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.capacity) {
      // Evict the least recently used key (first entry in the Map).
      const oldestKey = this.map.keys().next().value;
      this.map.delete(oldestKey);
    }

    const expiresAt = ttlMs > 0 ? Date.now() + ttlMs : Infinity;
    this.map.set(key, { value, expiresAt });
  }

  /** Number of entries currently stored (including not-yet-expired ones). */
  size() {
    return this.map.size;
  }

  /** Remove a specific key. Returns true if the key existed. */
  delete(key) {
    return this.map.delete(key);
  }

  /** Clear the entire cache. */
  clear() {
    this.map.clear();
  }
}

module.exports = SimpleLRU;