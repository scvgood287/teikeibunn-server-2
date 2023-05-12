import { DataSource, DataSourceOptions } from 'typeorm';
import { isProduction } from './constants';
import { Option, Product } from './entities';

const config: DataSourceOptions = true
  ? {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      entities: [Product, Option],
      // dropSchema: true,
      // synchronize: true,
      // cache: {
      //   type: 'redis',
      //   options: {
      //     url: process.env.REDIS_URL,
      //     tls: {
      //       rejectUnauthorized: false,
      //     },
      //   },
      // },
    }
  : {
      type: 'postgres',
      username: process.env.DATABASE_USER,
      host: process.env.DATABASE_HOST,
      database: process.env.DATABASE_DBNAME,
      password: process.env.DATABASE_PASSWORD,
      port: Number(process.env.DATABASE_PORT),
      entities: [Product, Option],
      // migrations: ['src/migrations/*.ts'],
      // synchronize: true,
      // dropSchema: true,
      // cache: {
      //   type: 'redis',
      //   options: {
      //     url: process.env.REDIS_URL,
      //   },
      // },
    };

const dataSource = new DataSource(config);

export default dataSource;

// psql -d zoadb -h 127.0.0.1 -p 5432 -U gu -w 07630763
