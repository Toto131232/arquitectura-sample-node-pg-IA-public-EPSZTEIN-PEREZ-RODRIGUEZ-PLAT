import Db from './db-pg.js';
import { buildSelectAllSql, buildSelectByIdSql, buildInsertSql, buildUpdateSql, buildDeleteByIdSql } from './../helpers/sql-crud-helper.js';

export default class AlumnosRepository {
    constructor() {
        console.log('Estoy en: AlumnosRepository-new.constructor()');
        this.db = new Db();
    }

    getAllAsync = async () => {
        console.log(`AlumnosRepository-new.getAllAsync()`);
        const sql = buildSelectAllSql('alumnos');
        return await this.db.queryAll(sql);
    }

    getByIdAsync = async (id) => {
        console.log(`AlumnosRepository-new.getByIdAsync(${id})`);
        const sql = buildSelectByIdSql('alumnos');
        return await this.db.queryOne(sql, [id]);
    }

    createAsync = async (entity) => {
        console.log(`AlumnosRepository-new.createAsync(${JSON.stringify(entity)})`);
        const sql = buildInsertSql('alumnos', [
            'nombre',
            'apellido',
            'id_curso',
            'fecha_nacimiento',
            'hace_deportes'
        ]);
        // [IA] Sin defaults silenciosos: el service ya validó los datos
        const values = [
            entity.nombre,
            entity.apellido,
            entity.id_curso,
            entity.fecha_nacimiento,
            entity.hace_deportes
        ];
        return await this.db.queryReturnId(sql, values);
    }

    updateAsync = async (entity) => {
        console.log(`AlumnosRepository-new.updateAsync(${JSON.stringify(entity)})`);
        let id = entity.id;

        const previousEntity = await this.getByIdAsync(id);
        if (previousEntity == null) return 0;

        const sql = buildUpdateSql('alumnos', [
            'nombre',
            'apellido',
            'id_curso',
            'fecha_nacimiento',
            'hace_deportes'
        ]);
        // [IA] Recibe entidad ya mergeada y validada desde el service
        const values = [
            id,
            entity.nombre,
            entity.apellido,
            entity.id_curso,
            entity.fecha_nacimiento,
            entity.hace_deportes
        ];
        return await this.db.queryRowCount(sql, values);
    }

    deleteByIdAsync = async (id) => {
        console.log(`AlumnosRepository-new.deleteByIdAsync(${id})`);
        const sql = buildDeleteByIdSql('alumnos');
        return await this.db.queryRowCount(sql, [id]);
    }
}
