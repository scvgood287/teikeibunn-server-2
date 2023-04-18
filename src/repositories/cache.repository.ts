import { ClientCommandOptions } from '@redis/client/dist/lib/client';
import { CommandOptions } from '@redis/client/dist/lib/command-options';
import { RedisCommandArgument } from '@redis/client/dist/lib/commands';
import { SetOptions } from 'redis';
import { redisClient } from '../clients';

export default {
  getCache: async (...args: [key: RedisCommandArgument] | [options: CommandOptions<ClientCommandOptions>, key: RedisCommandArgument]): Promise<string | null> =>
    await redisClient.get(...args),

  setCache: async (...args: [key: RedisCommandArgument, value: number | RedisCommandArgument, options?: SetOptions | undefined]) =>
    await redisClient.set(...args),

  expire: async (...args: [key: RedisCommandArgument, seconds: number, mode?: 'NX' | 'XX' | 'GT' | 'LT' | undefined]) => await redisClient.expire(...args),

  deleteCache: async (...args: [keys: RedisCommandArgument | RedisCommandArgument[]]) => await redisClient.del(...args),
};
