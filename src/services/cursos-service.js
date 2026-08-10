import CursosRepository from '../repositories/cursos-repository.js';
// [IA]
import { validarBodyObjeto, validarTextoObligatorio } from '../helpers/validaciones-helper.js';

export default class CursosService {
    constructor() {
        console.log('Estoy en: CursosService.constructor()');
        this.CursosRepository = new CursosRepository();
    }

    getAllAsync = async () => {
        console.log(`CursosService.getAllAsync()`);
        const returnArray = await this.CursosRepository.getAllAsync();
        return returnArray;
    }

    getByIdAsync = async (id) => {
        console.log(`CursosService.getByIdAsync(${id})`);
        const returnEntity = await this.CursosRepository.getByIdAsync(id);
        return returnEntity;
    }

    createAsync = async (entity) => {
        console.log(`CursosService.createAsync(${JSON.stringify(entity)})`);
        // [IA]
        const validado = this.validarInputCursoCreate(entity);
        const rowsAffected = await this.CursosRepository.createAsync(validado);
        return rowsAffected;
    }

    updateAsync = async (entity) => {
        console.log(`CursosService.updateAsync(${JSON.stringify(entity)})`);
        const previousEntity = await this.CursosRepository.getByIdAsync(entity.id);
        if (previousEntity == null) return 0;

        // [IA]
        const camposValidados = this.validarInputCursoUpdate(entity);
        const merged = {
            id     : entity.id,
            nombre : camposValidados.nombre ?? previousEntity.nombre
        };

        const rowsAffected = await this.CursosRepository.updateAsync(merged);
        return rowsAffected;
    }
    
    deleteByIdAsync = async (id) => {
        console.log(`CursosService.deleteByIdAsync(${id})`);
        const rowsAffected = await this.CursosRepository.deleteByIdAsync(id);
        return rowsAffected;
    }

    // [IA]
    validarInputCursoCreate = (entity) => {
        validarBodyObjeto(entity);
        return {
            nombre : validarTextoObligatorio('nombre', entity.nombre)
        };
    }

    // [IA]
    validarInputCursoUpdate = (entity) => {
        validarBodyObjeto(entity);
        const result = {};
        if (entity.nombre !== undefined) {
            result.nombre = validarTextoObligatorio('nombre', entity.nombre);
        }
        return result;
    }
}
