import { Knex } from 'knex';

const configuration: { [key: string]: Knex.Config } = {
    development: {
        client: 'pg',
        connection: {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: Number(process.env.DB_PORT)
        },
        pool: {
            min: 5,
            max: 10
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: `${__dirname}/../Infrastructure/Database/Migration`
        },
        seeds: {
            directory: `${__dirname}/../Infrastructure/Database/Seed`
        }
    },
    production: {
        client: 'pg',
        connection: {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: Number(process.env.DB_PORT)
        },
        pool: {
            min: 5,
            max: 10
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: `${__dirname}/../Infrastructure/Database/Migration`
        },
        seeds: {
            directory: `${__dirname}/../Infrastructure/Database/Seed`
        }
    },
};

module.exports = configuration;
