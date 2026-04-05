import app from './app';
import { env } from './config/env';
import prisma from './utils/prisma';

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log(' Database connected successfully');

    app.listen(env.PORT, () => {
      console.log(` Server running on http://localhost:${env.PORT}`);
      console.log(` Environment: ${env.NODE_ENV}`);
      console.log(` Health check: http://localhost:${env.PORT}/api/health`);
    });
  } catch (error) {
    console.error(' Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Handle graceful shutdowns for PaaS deployments (Render, Railway, Heroku).
// Ensures active database pool connections are flushed before container death.
process.on('SIGINT', async () => {
  console.log('\n Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

main();
