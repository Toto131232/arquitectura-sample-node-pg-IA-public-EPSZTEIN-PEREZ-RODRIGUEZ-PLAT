import Db from './db-pg.js';
import { buildSelectAllSql, buildSelectByIdSql, buildInsertSql, buildUpdateSql, buildDeleteByIdSql } from './../helpers/sql-crud-helper.js';

export default class MateriasRepository {
    constructor() {
        console.log('Estoy en: MateriasRepository.constructor()');
        this.db = new Db();
    }

    getAllAsync = async () => {
        console.log(`MateriasRepository.getAllAsync()`);
        const sql = buildSelectAllSql('materias');
        return await this.db.queryAll(sql);
    }

    getByIdAsync = async (id) => {
        console.log(`MateriasRepository.getByIdAsync(${id})`);
        const sql = buildSelectByIdSql('materias');
        return await this.db.queryOne(sql, [id]);
    }

    createAsync = async (entity) => {
        console.log(`MateriasRepository.createAsync(${JSON.stringify(entity)})`);
        const sql = buildInsertSql('materias', ['nombre']);
        // [IA]
        const values = [entity.nombre];
        return await this.db.queryReturnId(sql, values);
    }

    updateAsync = async (entity) => {
        console.log(`MateriasRepository.updateAsync(${JSON.stringify(entity)})`);
        const previousEntity = await this.getByIdAsync(entity.id);
        if (previousEntity == null) return 0;

        const sql = buildUpdateSql('materias', ['nombre']);
        // [IA]
        const values = [entity.id, entity.nombre];
        return await this.db.queryRowCount(sql, values);
    }

    deleteByIdAsync = async (id) => {
        console.log(`MateriasRepository.deleteByIdAsync(${id})`);
        const sql = buildDeleteByIdSql('materias');
        return await this.db.queryRowCount(sql, [id]);
    }
}
