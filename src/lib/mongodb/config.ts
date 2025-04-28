import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

// Initialize clientPromise with the appropriate connection based on environment
const clientPromise: Promise<MongoClient> = (process.env.NODE_ENV !== 'development')
  ? (function() {
      // In development mode, use a global variable so that the value
      // is preserved across module reloads caused by HMR (Hot Module Replacement).
      const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
      };

      if (!globalWithMongo._mongoClientPromise) {
        const client = new MongoClient(uri, options);
        globalWithMongo._mongoClientPromise = client.connect();
      }
      return globalWithMongo._mongoClientPromise;
    })()
  : (function() {
      // In production mode, it's best to not use a global variable.
      const client = new MongoClient(uri, options);
      return client.connect();
    })();

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise; 