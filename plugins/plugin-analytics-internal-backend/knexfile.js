const path = require('path');

export default {
  development: {
    client: 'pg',
    connection: {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: 'backstage_plugin_analytics-internal',
    },
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      extension: 'ts',
    },
  },
  production: {
    client: 'pg',
    connection: {
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: 'backstage_plugin_analytics-internal',
    },
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      extension: 'ts',
    },
  },
}; 