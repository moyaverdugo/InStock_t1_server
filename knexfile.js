import "dotenv/config";

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
export default {
  client: 'mysql2',
  connection: {
    host: process.env.DB_LOCAL_HOST,
    database: process.env.DB_LOCAL_DBNAME,
    user: process.env.DB_LOCAL_USER,
    password: process.env.DB_LOCAL_PASSWORD,
    charset: 'utf8'
  },
  migrations: {
    directory: './migrations', // Path to migrations
  },
  seeds: {
    directory: './seeds', // Path to seeds
  },
};
