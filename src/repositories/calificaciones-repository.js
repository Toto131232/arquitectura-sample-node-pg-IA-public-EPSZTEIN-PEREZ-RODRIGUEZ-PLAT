// [IA]
import Db from './db-pg.js';
import { buildSelectAllSql, buildSelectByIdSql, buildInsertSql, buildUpdateSql, buildDeleteByIdSql } from './../helpers/sql-crud-helper.js';

export default class CalificacionesRepository {
    constructor() {
        console.log('Estoy en: CalificacionesRepository.constructor()');
        this.db = new Db();
    }

    getAllAsync = async () => {
        console.log(`CalificacionesRepository.getAllAsync()`);
        const sql = buildSelectAllSql('calificaciones');
        return await this.db.queryAll(sql);
    }

    getByIdAsync = async (id) => {
        console.log(`CalificacionesRepository.getByIdAsync(${id})`);
        const sql = buildSelectByIdSql('calificaciones');
        return await this.db.queryOne(sql, [id]);
    }

    getByAlumnoAndMateriaAsync = async (idAlumno, idMateria) => {
        console.log(`CalificacionesRepository.getByAlumnoAndMateriaAsync(${idAlumno}, ${idMateria})`);
        const sql = 'SELECT * FROM calificaciones WHERE id_alumno=$1 AND id_materia=$2';
        return await this.db.queryOne(sql, [idAlumno, idMateria]);
    }

    createAsync = async (entity) => {
        console.log(`CalificacionesRepository.createAsync(${JSON.stringify(entity)})`);
        const columns = ['id_alumno', 'id_materia', 'nota'];
        const values  = [entity.id_alumno, entity.id_materia, entity.nota];

        if (entity.fecha != null) {
            columns.push('fecha');
            values.push(entity.fecha);
        }

        const sql = buildInsertSql('calificaciones', columns);
        return await this.db.queryReturnId(sql, values);
    }

    updateAsync = async (entity) => {
        console.log(`CalificacionesRepository.updateAsync(${JSON.stringify(entity)})`);
        const previousEntity = await this.getByIdAsync(entity.id);
        if (previousEntity == null) return 0;

        const sql = buildUpdateSql('calificaciones', ['id_alumno', 'id_materia', 'nota', 'fecha']);
        const values = [
            entity.id,
            entity.id_alumno,
            entity.id_materia,
            entity.nota,
            entity.fecha
        ];
        return await this.db.queryRowCount(sql, values);
    }

    deleteByIdAsync = async (id) => {
        console.log(`CalificacionesRepository.deleteByIdAsync(${id})`);
        const sql = buildDeleteByIdSql('calificaciones');
        return await this.db.queryRowCount(sql, [id]);
    }
}
