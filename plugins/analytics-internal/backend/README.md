# analytics-internal-backend

This plugin is responsible for providing the routes and database structure to manage analytics-related information. With it, you can manage the information without needing an external system.

## Installation

This plugin is installed via the `@raphanogueira/plugin-analytics-internal-backend` package. To install the Backstage backend package, run the following command sequence:

```bash
# From your root directory
yarn --cwd packages/backend add @raphanogueira/plugin-analytics-internal-backend
```

Then add the plugin to your backend in packages/backend/src/index.ts:

```ts
const backend = createBackend();
// ...
backend.add(import('@raphanogueira/plugin-analytics-internal-backend'));
```

## Configuration

A PostgreSQL database needs to be configured to store the data, following Backstage's own configuration pattern, as shown below.

```ts
export interface Config {
    backend: {
        database: {
            client: string
            connection: {
                host: string;
                port: number;
                user: string;
                password: string;
            };
        };
    }
}
```

If your application already has a database configuration but access is restricted for creating new tables, I recommend using the configuration as follows in your app-config.yaml to be able to generate the table for data storage:

```yaml
database:
    client: pg
    connection:
      host: your-host
      port: your-port
      user: your-user
      password: your-password
    plugin:
      analytics-internal:
        connection:
          database: your-database-default-name
```

## Development

1. To run it locally, simply execute yarn install in the project's root directory.

2. After installing the dependencies, just run yarn start, and it will execute the project with all the plugins present in the repository.

3. You need to use a PostgreSQL database for testing. The repository contains a YAML file to build the database: [link suspeito removido].

4. Access the [Metrics](http://localhost:3000/analytics-internal) menu to view the data.