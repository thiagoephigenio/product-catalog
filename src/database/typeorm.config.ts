import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  username: process.env.DATABASE_USER ?? 'catalog',
  password: process.env.DATABASE_PASSWORD ?? 'catalog',
  database: process.env.DATABASE_NAME ?? 'catalog',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: ['src/**/*.orm-entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  migrationsTableName: 'migrations',
});
