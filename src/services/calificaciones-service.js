// [IA]
import CalificacionesRepository from '../repositories/calificaciones-repository.js';
import AlumnosService from './alumnos-service.js';
import MateriasService from './materias-service.js';
import AppError from '../helpers/app-error.js';
import {
    validarBodyObjeto,
    validarEnteroPositivo,
    validarFechaOpcional,
    validarNota
} from '../helpers/validaciones-helper.js';

export default class CalificacionesService {
    constructor() {
        console.log('Estoy en: CalificacionesService.constructor()');
        this.CalificacionesRepository = new CalificacionesRepository();
        this.AlumnosService = new AlumnosService();
        this.MateriasService = new MateriasService();
    }

    getAllAsync = async () => {
        console.log(`CalificacionesService.getAllAsync()`);
        const returnArray = await this.CalificacionesRepository.getAllAsync();
        return returnArray;
    }

    getByIdAsync = async (id) => {
        console.log(`CalificacionesService.getByIdAsync(${id})`);
        const returnEntity = await this.CalificacionesRepository.getByIdAsync(id);
        return returnEntity;
    }

    createAsync = async (entity) => {
        console.log(`CalificacionesService.createAsync(${JSON.stringify(entity)})`);
        const validado = this.validarInputCalificacionCreate(entity);
        await this.validarAlumnoExiste(validado.id_alumno);
        await this.validarMateriaExiste(validado.id_materia);
        await this.validarCalificacionNoDuplicada(validado.id_alumno, validado.id_materia);
        const rowsAffected = await this.CalificacionesRepository.createAsync(validado);
        return rowsAffected;
    }

    updateAsync = async (entity) => {
        console.log(`CalificacionesService.updateAsync(${JSON.stringify(entity)})`);
        const previousEntity = await this.CalificacionesRepository.getByIdAsync(entity.id);
        if (previousEntity == null) return 0;

        const camposValidados = this.validarInputCalificacionUpdate(entity);
        const merged = {
            id         : entity.id,
            id_alumno  : camposValidados.id_alumno  ?? previousEntity.id_alumno,
            id_materia : camposValidados.id_materia ?? previousEntity.id_materia,
            nota       : camposValidados.nota       ?? previousEntity.nota,
            fecha      : camposValidados.fecha      !== undefined ? camposValidados.fecha : previousEntity.fecha
        };

        await this.validarAlumnoExiste(merged.id_alumno);
        await this.validarMateriaExiste(merged.id_materia);
        await this.validarCalificacionNoDuplicada(merged.id_alumno, merged.id_materia, entity.id);

        const rowsAffected = await this.CalificacionesRepository.updateAsync(merged);
        return rowsAffected;
    }

    deleteByIdAsync = async (id) => {
        console.log(`CalificacionesService.deleteByIdAsync(${id})`);
        const rowsAffected = await this.CalificacionesRepository.deleteByIdAsync(id);
        return rowsAffected;
    }

    validarInputCalificacionCreate = (entity) => {
        validarBodyObjeto(entity);
        return {
            id_alumno  : validarEnteroPositivo('id_alumno', entity.id_alumno),
            id_materia : validarEnteroPositivo('id_materia', entity.id_materia),
            nota       : validarNota(entity.nota),
            fecha      : validarFechaOpcional('fecha', entity.fecha)
        };
    }

    validarInputCalificacionUpdate = (entity) => {
        validarBodyObjeto(entity);
        const result = {};

        if (entity.id_alumno !== undefined) {
            result.id_alumno = validarEnteroPositivo('id_alumno', entity.id_alumno);
        }
        if (entity.id_materia !== undefined) {
            result.id_materia = validarEnteroPositivo('id_materia', entity.id_materia);
        }
        if (entity.nota !== undefined) {
            result.nota = validarNota(entity.nota);
        }
        if (entity.fecha !== undefined) {
            result.fecha = entity.fecha === null
                ? null
                : validarFechaOpcional('fecha', entity.fecha);
        }

        return result;
    }

    validarAlumnoExiste = async (idAlumno) => {
        const alumno = await this.AlumnosService.getByIdAsync(idAlumno);
        if (alumno == null) {
            throw AppError.notFound(`El alumno con id ${idAlumno} no existe.`);
        }
    }

    validarMateriaExiste = async (idMateria) => {
        const materia = await this.MateriasService.getByIdAsync(idMateria);
        if (materia == null) {
            throw AppError.notFound(`La materia con id ${idMateria} no existe.`);
        }
    }

    validarCalificacionNoDuplicada = async (idAlumno, idMateria, excludeId = null) => {
        const existente = await this.CalificacionesRepository.getByAlumnoAndMateriaAsync(idAlumno, idMateria);
        if (existente != null && existente.id !== excludeId) {
            throw AppError.conflict('Ya existe una calificación para ese alumno en esa materia.');
        }
    }
}
