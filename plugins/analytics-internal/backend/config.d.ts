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