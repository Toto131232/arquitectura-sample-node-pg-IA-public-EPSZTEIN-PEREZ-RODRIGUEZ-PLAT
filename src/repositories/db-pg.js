import pkg from 'pg'
import config from './../configs/db-config.js';
import LogHelper from './../helpers/log-helper.js'
// [IA]
import AppError from './../helpers/app-error.js';

const { Pool } = pkg;

export default class DbPg {
    constructor() {
        this.DBPool = null;
    }

    getDBPool = () => {
        if (this.DBPool == null) {
            this.DBPool = new Pool(config);
        }
        return this.DBPool;
    }

    // [IA]
    mapPgError = (error) => {
        LogHelper.logError(error);

        if (error.code === '23505') {
            throw AppError.conflict('El registro ya existe.');
        }
        if (error.code === '23503') {
            throw AppError.conflict('No se puede realizar la operación porque existen registros relacionados.');
        }
        if (error.code === '22P02') {
            throw AppError.badRequest('Formato de dato inválido.');
        }

        throw AppError.internal();
    }

    queryAll = async (sql, values = null) => {
        try {
            const resultPg = values
                ? await this.getDBPool().query(sql, values)
                : await this.getDBPool().query(sql);
            return resultPg.rows;
        } catch (error) {
            this.mapPgError(error);
        }
    }

    queryOne = async (sql, values = null) => {
        try {
            const resultPg = values
                ? await this.getDBPool().query(sql, values)
                : await this.getDBPool().query(sql);
            if (resultPg.rows.length > 0) {
                return resultPg.rows[0];
            }
            return null;
        } catch (error) {
            this.mapPgError(error);
        }
    }

    queryReturnId = async (sql, values = null) => {
        try {
            const resultPg = values
                ? await this.getDBPool().query(sql, values)
                : await this.getDBPool().query(sql);
            return resultPg.rows[0].id;
        } catch (error) {
            this.mapPgError(error);
        }
    }

    queryRowCount = async (sql, values = null) => {
        try {
            const resultPg = values
                ? await this.getDBPool().query(sql, values)
                : await this.getDBPool().query(sql);
            return resultPg.rowCount;
        } catch (error) {
            this.mapPgError(error);
        }
    }
}
