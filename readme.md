# distributed-cache

A distributed in-memory cache, built incrementally from scratch.

## Status
- [x] Step 1: single-node LRU cache with TTL, exposed via HTTP
- [ ] Step 2: cache as a standalone server with a client library
- [ ] Step 3: consistent hashing across multiple nodes
- [ ] Step 4: rate limiting
- [ ] Step 5: cache stampede protection

## Design
- LRU eviction implemented with a `Map` (insertion order = recency order).
- TTL enforced lazily on read; expired entries are deleted on access.
- HTTP layer is thin: `GET/PUT/DELETE /cache/:key` plus `GET /stats`.

## Run
    npm install
    npm start            # PORT=3000, CACHE_CAPACITY=100
    npm test

## Why not use Redis / an existing LRU library?
Step 1 is deliberately hand-written so the internals are understood before
any external system is introduced. A library-backed variant may be added later
for comparison.