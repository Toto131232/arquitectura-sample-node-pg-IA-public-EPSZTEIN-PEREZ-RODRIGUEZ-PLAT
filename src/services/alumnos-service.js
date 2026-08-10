import AlumnosRepository from '../repositories/alumnos-repository.js';
import CursosService from './cursos-service.js';
import { agregarEdad } from '../helpers/fechas-helper.js';
// [IA]
import AppError from '../helpers/app-error.js';
import {
    validarBodyObjeto,
    validarBooleanoOpcional,
    validarEnteroPositivo,
    validarEnteroPositivoOpcional,
    validarFechaOpcional,
    validarTextoObligatorio
} from '../helpers/validaciones-helper.js';

export default class AlumnosService {
    constructor() {
        console.log('Estoy en: AlumnosService.constructor()');
        this.AlumnosRepository = new AlumnosRepository();
        this.CursosService = new CursosService();
    }

    getAllAsync = async () => {
        console.log(`AlumnosService.getAllAsync()`);
        const returnArray = await this.AlumnosRepository.getAllAsync();
        if (returnArray == null) return null;
        return returnArray.map(alumno => agregarEdad(alumno));
    }

    getByIdAsync = async (id) => {
        console.log(`AlumnosService.getByIdAsync(${id})`);
        const returnEntity = await this.AlumnosRepository.getByIdAsync(id);
        // Regla de negocio que agrega la edad.!!!
        return agregarEdad(returnEntity);
    }

    createAsync = async (entity) => {
        console.log(`AlumnosService.createAsync(${JSON.stringify(entity)})`);
        // [IA] Validación de input antes del repository
        const validado = this.validarInputAlumnoCreate(entity);
        // Regla de negocio!!!
        await this.validarCursoExiste(validado.id_curso);
        const rowsAffected = await this.AlumnosRepository.createAsync(validado);
        return rowsAffected;
    }

    updateAsync = async (entity) => {
        console.log(`AlumnosService.updateAsync(${JSON.stringify(entity)})`);
        const previousEntity = await this.AlumnosRepository.getByIdAsync(entity.id);
        if (previousEntity == null) return 0;

        // [IA] Validación de input antes del repository
        const camposValidados = this.validarInputAlumnoUpdate(entity);
        const merged = {
            id               : entity.id,
            nombre           : camposValidados.nombre           ?? previousEntity.nombre,
            apellido         : camposValidados.apellido         ?? previousEntity.apellido,
            id_curso         : camposValidados.id_curso         !== undefined ? camposValidados.id_curso         : previousEntity.id_curso,
            fecha_nacimiento : camposValidados.fecha_nacimiento !== undefined ? camposValidados.fecha_nacimiento : previousEntity.fecha_nacimiento,
            hace_deportes    : camposValidados.hace_deportes    !== undefined ? camposValidados.hace_deportes    : previousEntity.hace_deportes
        };

        // Regla de Negocio!
        if (merged.id_curso != null) {
            await this.validarCursoExiste(merged.id_curso);
        }

        const rowsAffected = await this.AlumnosRepository.updateAsync(merged);
        return rowsAffected;
    }

    deleteByIdAsync = async (id) => {
        console.log(`AlumnosService.deleteByIdAsync(${id})`);
        const rowsAffected = await this.AlumnosRepository.deleteByIdAsync(id);
        return rowsAffected;
    }

    // [IA]
    validarInputAlumnoCreate = (entity) => {
        validarBodyObjeto(entity);
        return {
            nombre           : validarTextoObligatorio('nombre', entity.nombre),
            apellido         : validarTextoObligatorio('apellido', entity.apellido),
            id_curso         : validarEnteroPositivoOpcional('id_curso', entity.id_curso),
            fecha_nacimiento : validarFechaOpcional('fecha_nacimiento', entity.fecha_nacimiento),
            hace_deportes    : validarBooleanoOpcional('hace_deportes', entity.hace_deportes)
        };
    }

    // [IA]
    validarInputAlumnoUpdate = (entity) => {
        validarBodyObjeto(entity);
        const result = {};

        if (entity.nombre !== undefined) {
            result.nombre = validarTextoObligatorio('nombre', entity.nombre);
        }
        if (entity.apellido !== undefined) {
            result.apellido = validarTextoObligatorio('apellido', entity.apellido);
        }
        if (entity.id_curso !== undefined) {
            result.id_curso = entity.id_curso === null
                ? null
                : validarEnteroPositivo('id_curso', entity.id_curso);
        }
        if (entity.fecha_nacimiento !== undefined) {
            result.fecha_nacimiento = entity.fecha_nacimiento === null
                ? null
                : validarFechaOpcional('fecha_nacimiento', entity.fecha_nacimiento);
        }
        if (entity.hace_deportes !== undefined) {
            result.hace_deportes = entity.hace_deportes === null
                ? null
                : validarBooleanoOpcional('hace_deportes', entity.hace_deportes);
        }

        return result;
    }

    validarCursoExiste = async (idCurso) => {
        if (idCurso == null) return; // Early return

        const curso = await this.CursosService.getByIdAsync(idCurso);
        if (curso == null) {
            // [IA] 404 para recurso referenciado inexistente
            throw AppError.notFound(`El curso con id ${idCurso} no existe.`);
        }
    }
}
