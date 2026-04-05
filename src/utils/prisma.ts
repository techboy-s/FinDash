import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { env } from '../config/env';

// We use 'pg' pool mapped through PrismaPg adapter rather than standard Prisma drivers
// to support Neon's serverless connection pooling more efficiently over TCP.
const pool = new Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
