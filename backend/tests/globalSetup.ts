import { execSync } from 'node:child_process';

/** Create a clean SQLite test database from the Prisma schema before the suite runs. */
export default function setup(): void {
  execSync('npx prisma db push --skip-generate --force-reset --accept-data-loss', {
    stdio: 'inherit',
    env: process.env,
  });
}
