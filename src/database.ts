import 'dotenv/config'
import { env } from './env/index.js';

import knexLib from 'knex';
import type { Knex  } from 'knex';

const setupKnex = knexLib;


export const config: Knex.Config = {
  client: 'sqlite3',
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
};

export const knex = setupKnex(config);