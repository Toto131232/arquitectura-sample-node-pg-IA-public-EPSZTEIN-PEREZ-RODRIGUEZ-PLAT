import Db from './db-pg.js';
import { buildSelectAllSql, buildSelectByIdSql, buildInsertSql, buildUpdateSql, buildDeleteByIdSql } from './../helpers/sql-crud-helper.js';

export default class CursosRepository {
    constructor() {
        console.log('Estoy en: CursosRepository.constructor()');
        this.db = new Db();
    }

    getAllAsync = async () => {
        console.log(`CursosRepository.getAllAsync()`);
        const sql = buildSelectAllSql('cursos');
        return await this.db.queryAll(sql);
    }

    getByIdAsync = async (id) => {
        console.log(`CursosRepository.getByIdAsync(${id})`);
        const sql = buildSelectByIdSql('cursos');
        return await this.db.queryOne(sql, [id]);
    }

    createAsync = async (entity) => {
        console.log(`CursosRepository.createAsync(${JSON.stringify(entity)})`);
        const sql = buildInsertSql('cursos', ['nombre']);
        // [IA]
        const values = [entity.nombre];
        return await this.db.queryReturnId(sql, values);
    }

    updateAsync = async (entity) => {
        console.log(`CursosRepository.updateAsync(${JSON.stringify(entity)})`);
        const previousEntity = await this.getByIdAsync(entity.id);
        if (previousEntity == null) return 0;

        const sql = buildUpdateSql('cursos', ['nombre']);
        // [IA]
        const values = [entity.id, entity.nombre];
        return await this.db.queryRowCount(sql, values);
    }

    deleteByIdAsync = async (id) => {
        console.log(`CursosRepository.deleteByIdAsync(${id})`);
        const sql = buildDeleteByIdSql('cursos');
        return await this.db.queryRowCount(sql, [id]);
    }
}
