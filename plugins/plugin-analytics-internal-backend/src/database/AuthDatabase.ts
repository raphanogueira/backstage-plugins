import {
  DatabaseService,
  resolvePackagePath,
} from '@backstage/backend-plugin-api';
import { Knex } from 'knex';

const migrationsDir = resolvePackagePath(
  '@raphanogueira/plugin-analytics-internal-backend',
  'migrations',
);

/**
 * Ensures that a database connection is established exactly once and only when
 * asked for, and runs migrations.
 */
export class AuthDatabase {
  private readonly database: DatabaseService;
  private promise: Promise<Knex> | undefined;

  static create(database: DatabaseService): AuthDatabase {
    return new AuthDatabase(database);
  }

  static async runMigrations(knex: Knex): Promise<void> {
    await knex.migrate.latest({
      directory: migrationsDir,
    });
  }

  private constructor(database: DatabaseService) {
    this.database = database;
  }

  get(): Promise<Knex> {
    this.promise ??= this.database.getClient().then(async client => {
      if (!this.database.migrations?.skip) {
        await AuthDatabase.runMigrations(client);
      }
      return client;
    });

    return this.promise;
  }
}