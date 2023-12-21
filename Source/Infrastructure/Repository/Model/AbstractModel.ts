import { Knex } from 'knex';

import { Transaction, KnexDatabase, IErrorDatabase } from '@/Infrastructure/Database/KnexDatabase';
import { ErrorDatabase, ErrorDatabaseKey } from '@/Common/Error';

export abstract class AbstractModel<T> {
    protected _tableName: string;
    protected _knex: Knex;

    protected constructor(tableName: string) {
        this._tableName = tableName;
        this._knex = KnexDatabase.getInstance().database as Knex;
    }

    protected transformColumnsToArray<K extends string>(columns: Partial<Record<K, string | boolean>>): string[] {
        const columnsArray: string[] = [];
        for (const column in columns)
            if (typeof columns[column] === 'boolean' && columns[column])
                columnsArray.push(column);
            else if (typeof columns[column] === 'string' && (columns[column] as string).length > 0)
                columnsArray.push(columns[column] as string);
        if (columnsArray.length === 0)
            columnsArray.push('*');
        return columnsArray;
    }

    private forwardException(err: unknown): void {
        if (err instanceof ErrorDatabase)
            throw err;
        switch ((err as IErrorDatabase)['code']) { // https://docs.postgresql.fr/9.6/errcodes-appendix.html
        case '23505':
            throw new ErrorDatabase({
                key: ErrorDatabaseKey.MODEL_UNIQUE_CONSTRAINT_ERROR,
                interpolation: {
                    tableName: this._tableName,
                    constraint: (err as IErrorDatabase).constraint,
                },
                detail: err,
            });
        default:
            throw new ErrorDatabase({
                key: ErrorDatabaseKey.OTHER_DATABASE_ERROR,
                detail: err
            });
        }
    }

    public create(entity: Partial<T>[], columnToSelect: Partial<Record<keyof T, boolean | string>>): Promise<T[] | void> {
        return this._knex.insert(entity)
            .into(this._tableName)
            .returning(this.transformColumnsToArray(columnToSelect))
            .then((result: T[]) => {
                if (result.length === 0)
                    throw new ErrorDatabase({
                        key: ErrorDatabaseKey.MODEL_NOT_CREATED,
                        interpolation: { tableName: this._tableName },
                    });
                return result;
            })
            .catch((err: unknown): void => {
                this.forwardException(err);
            });
    }

    public transactionCreate(entity: Partial<T>[], columnToSelect: Partial<Record<keyof T, boolean | string>>, trx: Transaction): Promise<T[] | void> {
        return this._knex.insert(entity)
            .into(this._tableName)
            .returning(this.transformColumnsToArray(columnToSelect))
            .transacting(trx)
            .then((result: T[]) => {
                if (result.length === 0)
                    throw new ErrorDatabase({
                        key: ErrorDatabaseKey.MODEL_NOT_CREATED,
                        interpolation: { tableName: this._tableName },
                    });
                return result;
            })
            .catch((err: unknown): void => {
                this.forwardException(err);
            });
    }

    public async update(entity: Partial<T>, entityToUpdate: Partial<T>): Promise<void> {
        await this._knex.update(entity)
            .where(entityToUpdate)
            .from(this._tableName)
            .then((result: number) => {
                if (result === 0)
                    throw new ErrorDatabase({
                        key: ErrorDatabaseKey.MODEL_NOT_UPDATED,
                        interpolation: { tableName: this._tableName },
                    });
            })
            .catch((err: unknown): void => {
                this.forwardException(err);
            });
    }

    public async transactionUpdate(entity: Partial<T>, entityToUpdate: Partial<T>, trx: Transaction): Promise<void> {
        await this._knex.update(entity)
            .where(entityToUpdate)
            .from(this._tableName)
            .transacting(trx)
            .then((result: number) => {
                if (result === 0)
                    throw new ErrorDatabase({
                        key: ErrorDatabaseKey.MODEL_NOT_UPDATED,
                        interpolation: { tableName: this._tableName },
                    });
            })
            .catch((err: unknown): void => {
                this.forwardException(err);
            });
    }

    public async delete(entityToDelete: Partial<T>): Promise<void> {
        await this._knex.delete()
            .where(entityToDelete)
            .from(this._tableName)
            .then((result: number) => {
                if (result === 0)
                    throw new ErrorDatabase({
                        key: ErrorDatabaseKey.MODEL_NOT_DELETED,
                        interpolation: { tableName: this._tableName },
                    });
            })
            .catch((err: unknown): void => {
                this.forwardException(err);
            });
    }

    public async transactionDelete(entityToDelete: Partial<T>, trx: Transaction): Promise<void> {
        await this._knex.delete()
            .where(entityToDelete)
            .from(this._tableName)
            .transacting(trx)
            .then((result: number) => {
                if (result === 0)
                    throw new ErrorDatabase({
                        key: ErrorDatabaseKey.MODEL_NOT_DELETED,
                        interpolation: { tableName: this._tableName },
                    });
            })
            .catch((err: unknown): void => {
                this.forwardException(err);
            });
    }

    public get(entityToSearch: Partial<T>, columnToSelect: Partial<Record<keyof T, boolean | string>>): Promise<T[] | void> {
        return this._knex.select(this.transformColumnsToArray(columnToSelect))
            .from(this._tableName)
            .where(entityToSearch)
            .then((result: T[]) => {
                if (result.length === 0)
                    throw new ErrorDatabase({
                        key: ErrorDatabaseKey.MODEL_NOT_FOUND,
                        interpolation: { tableName: this._tableName },
                    });
                return result;
            })
            .catch((err: unknown): void => {
                this.forwardException(err);
            });
    }

    public transactionGet(entityToSearch: Partial<T>, columnToSelect: Partial<Record<keyof T, boolean | string>>, trx: Transaction): Promise<T[] | void> {
        return this._knex.select(this.transformColumnsToArray(columnToSelect))
            .from(this._tableName)
            .where(entityToSearch)
            .transacting(trx)
            .then((result: T[]) => {
                if (result.length === 0)
                    throw new ErrorDatabase({
                        key: ErrorDatabaseKey.MODEL_NOT_FOUND,
                        interpolation: { tableName: this._tableName },
                    });
                return result;
            })
            .catch((err: unknown): void => {
                this.forwardException(err);
            });
    }

    public getAll(columnToSelect: Partial<Record<keyof T, boolean | string>>): Promise<T[] | void> {
        return this._knex.select(this.transformColumnsToArray(columnToSelect))
            .from(this._tableName)
            .then((result: T[]) => {
                if (result.length === 0)
                    throw new ErrorDatabase({
                        key: ErrorDatabaseKey.MODEL_NOT_FOUND,
                        interpolation: { tableName: this._tableName },
                    });
                return result;
            })
            .catch((err: unknown): void => {
                this.forwardException(err);
            });
    }

    public transactionGetAll(columnToSelect: Partial<Record<keyof T, boolean | string>>, trx: Transaction): Promise<T[] | void> {
        return this._knex.select(this.transformColumnsToArray(columnToSelect))
            .from(this._tableName)
            .transacting(trx)
            .then((result: T[]) => {
                if (result.length === 0)
                    throw new ErrorDatabase({
                        key: ErrorDatabaseKey.MODEL_NOT_FOUND,
                        interpolation: { tableName: this._tableName },
                    });
                return result;
            })
            .catch((err: unknown): void => {
                this.forwardException(err);
            });
    }
}
