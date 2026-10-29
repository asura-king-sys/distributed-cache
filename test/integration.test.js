// test/integration.test.js
const createServer = require('../src/server');
const CacheClient = require('../src/client');

describe('server + client integration', () => {
  let server;
  let client;
  let port;

  beforeAll((done) => {
    const app = createServer(3); // small capacity to trigger eviction in tests
    // Listen on port 0 = OS assigns an unused port
    server = app.listen(0, () => {
      port = server.address().port;
      client = new CacheClient(`http://localhost:${port}`);
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  test('health endpoint reports ok', async () => {
    expect(await client.health()).toBe(true);
  });

  test('put then get returns the value', async () => {
    await client.put('name', 'Hardik');
    expect(await client.get('name')).toBe('Hardik');
  });

  test('get on missing key returns undefined', async () => {
    expect(await client.get('does-not-exist')).toBeUndefined();
  });

  test('ttl expires the value', async () => {
    await client.put('temp', 'value', 50);
    expect(await client.get('temp')).toBe('value');
    await new Promise((r) => setTimeout(r, 80));
    expect(await client.get('temp')).toBeUndefined();
  });

  test('delete removes the key', async () => {
    await client.put('to-delete', 1);
    expect(await client.delete('to-delete')).toBe(true);
    expect(await client.get('to-delete')).toBeUndefined();
    expect(await client.delete('to-delete')).toBe(false);
  });

  test('lru eviction works through HTTP', async () => {
    // capacity is 3
    await client.put('a', 1);
    await client.put('b', 2);
    await client.put('c', 3);
    await client.get('a');       // 'a' now most-recent
    await client.put('d', 4);    // should evict 'b'
    expect(await client.get('a')).toBe(1);
    expect(await client.get('b')).toBeUndefined();
    expect(await client.get('d')).toBe(4);
  });

  test('keys with slashes are encoded correctly', async () => {
    await client.put('user/1', 'alice');
    expect(await client.get('user/1')).toBe('alice');
  });
});