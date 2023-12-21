import { Knex, knex } from 'knex';
import Transaction = Knex.Transaction;

import { EnvironmentConfiguration } from '@/Config';
import { ErrorDatabase, ErrorDatabaseKey } from '@/Common/Error';

export type { Transaction };

export interface IErrorDatabase {
    length: number;
    name: string;
    severity: string;
    code: string;
    detail: string;
    hint: string;
    position: string;
    internalPosition: string;
    internalQuery: string;
    where: string;
    schema: string;
    table: string;
    column: string;
    dataType: string;
    constraint: string;
    file: string;
    line: string;
    routine: string;
    stack: string;
    message: string;
}

export class KnexDatabase {
    private static _instance: KnexDatabase;
    private readonly _config: Knex.Config;
    private _database: Knex | undefined;

    private constructor() {
        this._config = {
            client: 'pg',
            connection: {
                host: EnvironmentConfiguration.env.DB_HOST,
                user: EnvironmentConfiguration.env.DB_USER,
                password: EnvironmentConfiguration.env.DB_PASSWORD,
                database: EnvironmentConfiguration.env.DB_NAME,
                port: EnvironmentConfiguration.env.DB_PORT,
            },
            pool: {
                min: 0,
                max: 10,
            },
            acquireConnectionTimeout: 10000,
        };
    }

    public connect(): void {
        try {
            this._database = knex(this._config);
        } catch (error) {
            throw new ErrorDatabase({
                key: ErrorDatabaseKey.DB_CONNECTION_ERROR,
                detail: error
            });
        }
    }

    public disconnect(): void {
        try {
            this._database?.destroy();
        } catch (error) {
            throw new ErrorDatabase({
                key: ErrorDatabaseKey.DB_DISCONNECT_ERROR,
                detail: error
            });
        }
    }

    public static getInstance(): KnexDatabase {
        if (!KnexDatabase._instance)
            KnexDatabase._instance = new KnexDatabase();
        return KnexDatabase._instance;
    }

    get database(): Knex | undefined {
        return this._database;
    }

    public checkIfDatabaseIsOnline(): Promise<boolean> {
        if (!this._database)
            return Promise.resolve(false);
        return this._database.raw('SELECT 1').then((): boolean => true).catch((): boolean => false);
    }
}
