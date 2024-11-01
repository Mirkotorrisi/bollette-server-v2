import { Module } from '@nestjs/common';
import { createClient } from '@redis/client';

const reconnectStrategy = (options) => {
  console.log('this is the retry strategy');
  if (
    options.error &&
    (options.error.code === 'ECONNREFUSED' ||
      options.error.code === 'NR_CLOSED')
  ) {
    // Try reconnecting after 5 seconds
    console.error(
      'Redis-The server refused the connection. Retrying connection...',
    );
    return 5000;
  }
  if (options.total_retry_time > 1000 * 60 * 60) {
    // End reconnecting after a specific timeout and flush all commands with an individual error
    return new Error('Retry time exhausted');
  }
  if (options.attempt > 50) {
    // End reconnecting with built in error
    return undefined;
  }
  // reconnect after
  return Math.min(options.attempt * 100, 3000);
};

@Module({
  providers: [
    {
      provide: 'REDIS',
      useFactory: async (): Promise<any> => {
        const client = createClient({
          socket: {
            reconnectStrategy,
            connectTimeout: 60000,
            host: process.env.REDIS_URI,
            port: +process.env.REDIS_PORT,
          },
          password: process.env.REDIS_PASSWORD,
        });

        await client.connect();
        return client;
      },
    },
  ],
  exports: ['REDIS'],
})
export class RedisModule {}
