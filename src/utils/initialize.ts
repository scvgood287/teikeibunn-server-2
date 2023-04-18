import { redisClient, postgresqlDataSource } from '../clients';

export default () => {
  redisClient.connect().then();
  redisClient.flushAll().then();

  postgresqlDataSource
    .initialize()
    .then(datasource => {
      global.isDbReady = true;
      console.log('Data Source has been initialized!');
    })
    .catch(err => {
      global.isDbReady = false;
      console.error('Error during Data Source initialization', err);
      postgresqlDataSource.destroy();
    });
};
