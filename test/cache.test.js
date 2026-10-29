// test/cache.test.js
const SimpleLRU = require('../src/cache');

describe('SimpleLRU', () => {
  test('stores and retrieves a value', () => {
    const c = new SimpleLRU(2);
    c.put('a', 1);
    expect(c.get('a')).toBe(1);
  });

  test('returns undefined for a missing key', () => {
    const c = new SimpleLRU(2);
    expect(c.get('nope')).toBeUndefined();
  });

  test('evicts the least recently used key when full', () => {
    const c = new SimpleLRU(2);
    c.put('a', 1);
    c.put('b', 2);
    c.get('a');          // 'a' becomes most recently used
    c.put('c', 3);       // should evict 'b', not 'a'
    expect(c.get('a')).toBe(1);
    expect(c.get('b')).toBeUndefined();
    expect(c.get('c')).toBe(3);
  });

  test('updating an existing key refreshes its recency', () => {
    const c = new SimpleLRU(2);
    c.put('a', 1);
    c.put('b', 2);
    c.put('a', 99);      // 'a' refreshed, 'b' is now LRU
    c.put('c', 3);       // should evict 'b'
    expect(c.get('b')).toBeUndefined();
    expect(c.get('a')).toBe(99);
  });

  test('expires a key after its TTL', async () => {
    const c = new SimpleLRU(2);
    c.put('a', 1, 20);   // 20 ms TTL
    expect(c.get('a')).toBe(1);
    await new Promise(r => setTimeout(r, 30));
    expect(c.get('a')).toBeUndefined();
  });

  test('TTL of 0 means no expiry', async () => {
    const c = new SimpleLRU(2);
    c.put('a', 1, 0);
    await new Promise(r => setTimeout(r, 20));
    expect(c.get('a')).toBe(1);
  });

  test('rejects invalid capacity', () => {
    expect(() => new SimpleLRU(0)).toThrow();
    expect(() => new SimpleLRU(-1)).toThrow();
  });
});