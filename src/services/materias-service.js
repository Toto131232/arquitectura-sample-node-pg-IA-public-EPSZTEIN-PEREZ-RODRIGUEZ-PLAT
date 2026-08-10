// [IA]
import MateriasRepository from '../repositories/materias-repository.js';
import { validarBodyObjeto, validarTextoObligatorio } from '../helpers/validaciones-helper.js';

export default class MateriasService {
    constructor() {
        console.log('Estoy en: MateriasService.constructor()');
        this.MateriasRepository = new MateriasRepository();
    }

    getAllAsync = async () => {
        console.log(`MateriasService.getAllAsync()`);
        const returnArray = await this.MateriasRepository.getAllAsync();
        return returnArray;
    }

    getByIdAsync = async (id) => {
        console.log(`MateriasService.getByIdAsync(${id})`);
        const returnEntity = await this.MateriasRepository.getByIdAsync(id);
        return returnEntity;
    }

    createAsync = async (entity) => {
        console.log(`MateriasService.createAsync(${JSON.stringify(entity)})`);
        const validado = this.validarInputMateriaCreate(entity);
        const rowsAffected = await this.MateriasRepository.createAsync(validado);
        return rowsAffected;
    }

    updateAsync = async (entity) => {
        console.log(`MateriasService.updateAsync(${JSON.stringify(entity)})`);
        const previousEntity = await this.MateriasRepository.getByIdAsync(entity.id);
        if (previousEntity == null) return 0;

        const camposValidados = this.validarInputMateriaUpdate(entity);
        const merged = {
            id     : entity.id,
            nombre : camposValidados.nombre ?? previousEntity.nombre
        };

        const rowsAffected = await this.MateriasRepository.updateAsync(merged);
        return rowsAffected;
    }

    deleteByIdAsync = async (id) => {
        console.log(`MateriasService.deleteByIdAsync(${id})`);
        const rowsAffected = await this.MateriasRepository.deleteByIdAsync(id);
        return rowsAffected;
    }

    validarInputMateriaCreate = (entity) => {
        validarBodyObjeto(entity);
        return {
            nombre : validarTextoObligatorio('nombre', entity.nombre)
        };
    }

    validarInputMateriaUpdate = (entity) => {
        validarBodyObjeto(entity);
        const result = {};
        if (entity.nombre !== undefined) {
            result.nombre = validarTextoObligatorio('nombre', entity.nombre);
        }
        return result;
    }
}
