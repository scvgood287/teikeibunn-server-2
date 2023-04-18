import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { config } from '../ormconfig';

dotenv.config();

global.isDbReady = false;

const postgresqlDataSource = new DataSource(config);

export default postgresqlDataSource;
