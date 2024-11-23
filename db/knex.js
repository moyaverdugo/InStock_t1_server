import knex from 'knex';
import knexConfig from '../knexfile.js'; 

// Initialize a Knex instance with the development configuration
const db = knex(knexConfig);

export default db;
