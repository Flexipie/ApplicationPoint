import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const runMigrations = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  console.log('⏳ Running migrations...');

  const connection = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(connection);

  await migrate(db, { migrationsFolder: './db/migrations' });

  await connection.end();

  console.log('✅ Migrations completed successfully');
};

runMigrations().catch((err) => {
  console.error('❌ Migration failed');
  console.error(err);
  process.exit(1);
});
