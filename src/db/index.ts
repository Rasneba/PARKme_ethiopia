import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & {
  __parkmePool?: Pool;
  __parkmeDb?: NodePgDatabase;
};

function getPool(): Pool {
  if (globalForDb.__parkmePool) return globalForDb.__parkmePool;
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }
  const pool = new Pool({ connectionString: databaseUrl });
  globalForDb.__parkmePool = pool;
  return pool;
}

function getDb(): NodePgDatabase {
  if (globalForDb.__parkmeDb) return globalForDb.__parkmeDb;
  const dbInstance = drizzle(getPool());
  if (process.env.NODE_ENV !== "production") {
    globalForDb.__parkmeDb = dbInstance;
  }
  return dbInstance;
}

export const pool = {
  get current() {
    return getPool();
  },
} as unknown as Pool;

export const db = new Proxy({} as NodePgDatabase, {
  get(_target, prop, receiver) {
    const instance = getDb() as any;
    const value = instance[prop];
    return typeof value === "function" ? value.bind(instance) : value;
  },
}) as unknown as NodePgDatabase;
