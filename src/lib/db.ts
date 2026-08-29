import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI as string;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// A Next.js dev server reloads modules on every request in some cases, and
// serverless deployments can spin up many isolated instances, so the
// connection is cached on the global object - otherwise every request would
// open a brand new MongoDB connection. (There was no equivalent concern in
// the old long-running Express process, which called connectDB() once at
// startup - this caching is the Next.js-appropriate version of that.)
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongooseCache || { conn: null, promise: null };
global._mongooseCache = cached;

async function connectDB() {
  if (!MONGO_URI) {
    throw new Error('Please define the MONGO_URI environment variable');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI).then((m) => {
      console.log(`MongoDB Connected: ${m.connection.host}`);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectDB;