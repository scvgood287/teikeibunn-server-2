import dotenv from 'dotenv';
import dataSource from '../ormconfig';

dotenv.config();

global.isDbReady = false;

const postgresqlDataSource = dataSource;

export default postgresqlDataSource;
