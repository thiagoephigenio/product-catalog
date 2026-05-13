import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const isCompiled = __filename.endsWith('.js');

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  username: process.env.DATABASE_USER ?? 'catalog',
  password: process.env.DATABASE_PASSWORD ?? 'catalog',
  database: process.env.DATABASE_NAME ?? 'catalog',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: isCompiled
    ? ['dist/**/*.orm-entity.js']
    : ['src/**/*.orm-entity.ts'],
  migrations: isCompiled
    ? ['dist/database/migrations/*.js']
    : ['src/database/migrations/*.ts'],
  migrationsTableName: 'migrations',
});
