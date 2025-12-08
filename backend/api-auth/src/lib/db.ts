// Deprecated compatibility module.
// The database helpers have been split into `mongo.ts` and `redis.ts`.
// Import from those files directly in new code. This file re-exports
// the functions for backward compatibility.

export { connectMongo, mongoose } from './mongo'
export { connectRedis, getRedis } from './redis'

