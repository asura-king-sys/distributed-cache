
class CacheClient {
  /**
   * @param {string} baseUrl - e.g. "http://localhost:3000"
   */
  constructor(baseUrl) {
    if (!baseUrl) throw new Error('baseUrl is required');
    // Strip trailing slash so we can safely append paths
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async get(key) {
    const res = await fetch(`${this.baseUrl}/cache/${encodeURIComponent(key)}`);
    if (res.status === 404) return undefined;
    if (!res.ok) {
      throw new Error(`GET ${key} failed: ${res.status} ${res.statusText}`);
    }
    const body = await res.json();
    return body.value;
  }

  async put(key, value, ttlMs = 0) {
    const res = await fetch(`${this.baseUrl}/cache/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value, ttl: ttlMs }),
    });
    if (!res.ok) {
      throw new Error(`PUT ${key} failed: ${res.status} ${res.statusText}`);
    }
    return true;
  }

  async delete(key) {
    const res = await fetch(`${this.baseUrl}/cache/${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
    if (res.status === 404) return false;
    if (!res.ok) {
      throw new Error(`DELETE ${key} failed: ${res.status} ${res.statusText}`);
    }
    return true;
  }

  /** Returns true if the node is up and healthy. */
  async health() {
    try {
      const res = await fetch(`${this.baseUrl}/health`);
      if (!res.ok) return false;
      const body = await res.json();
      return body.status === 'ok';
    } catch {
      // fetch throws on connection refused, DNS failure, etc.
      return false;
    }
  }
}

module.exports = CacheClient;