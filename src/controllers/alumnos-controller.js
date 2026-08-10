import { Router } from 'express';
import AlumnosService from './../services/alumnos-service.js'
import Alumno from './../entities/alumno.js'
import respuestasHelper from '../helpers/respuestas-helper.js';
// [IA]
import { parsearId } from '../helpers/validaciones-helper.js';

const router = Router();
const currentService = new AlumnosService();

// Endpoint de ejemplo: crear un alumno desde código usando la clase Alumno
// En vez de recibir los datos del body (req.body), los armamos nosotros desde código.
// Para eso usamos la clase Alumno de la carpeta entities.
// Probar con: GET http://localhost:3000/api/alumnos/test-insert
router.get('/test-insert', async (req, res) => {
    console.log('/test-insert');
    try {
        const nuevoAlumno = new Alumno('Willy', 'Wonka', 1, '2005-07-15', true);

        console.log('Objeto Alumno creado desde código:', nuevoAlumno);

        const newId = await currentService.createAsync(nuevoAlumno);
        if (newId > 0) {
            respuestasHelper.responderCreated(res, {
                message : `Se creó el alumno desde código con id: ${newId}`,
                alumno  : nuevoAlumno,
                newId   : newId
            });
        } else {
            respuestasHelper.responderBadRequestJson(res, { message: 'No se pudo crear el alumno.' });
        }
    } catch (error) {
        respuestasHelper.responderError(res, error);
    }
});

router.get('', async (req, res) => {
    try {
        console.log(`AlumnosController.get`);
        const returnArray = await currentService.getAllAsync();
        if (returnArray != null){
            respuestasHelper.responderOk(res, returnArray);
        } else {
            respuestasHelper.responderInternalError(res, `Error interno.`);
        }
    } catch (error) {
        respuestasHelper.responderError(res, error);
    }
});

router.get('/:id', async (req, res) => {
    try {
        // [IA]
        const id = parsearId(req.params.id);
        const returnEntity = await currentService.getByIdAsync(id);
        if (returnEntity != null){
            respuestasHelper.responderOk(res, returnEntity);
        } else {
            respuestasHelper.responderNotFound(res, id);
        }
    } catch (error) {
        respuestasHelper.responderError(res, error);
    }
});

router.post('', async (req, res) => {
    try {
        let entity = req.body;
        const newId = await currentService.createAsync(entity);
        if (newId > 0 ){
            respuestasHelper.responderCreated(res, newId);
        } else {
            respuestasHelper.responderBadRequestJson(res, null);
        }
    } catch (error) {
        respuestasHelper.responderError(res, error);
    }
});

router.put('/:id', async (req, res) => {
    try {
        // [IA]
        const id = parsearId(req.params.id);
        let entity = req.body;

        if (entity.id !== undefined && entity.id !== null && entity.id !== '') {
            const bodyId = parsearId(entity.id, 'id del body');
            if (bodyId !== id) {
                return respuestasHelper.responderBadRequest(res, `El id de la URL (${id}) no coincide con el id del body (${bodyId}).`);
            }
        }

        entity.id = id;
        const rowsAffected = await currentService.updateAsync(entity);
        if (rowsAffected != 0){
            respuestasHelper.responderOk(res, rowsAffected);
        } else {
            respuestasHelper.responderNotFound(res, id);
        }
    } catch (error) {
        respuestasHelper.responderError(res, error);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        // [IA]
        const id = parsearId(req.params.id);
        const rowCount = await currentService.deleteByIdAsync(id);
        if (rowCount != 0){
            respuestasHelper.responderOk(res, null);
        } else {
            respuestasHelper.responderNotFound(res, id);
        }
    } catch (error) {
        respuestasHelper.responderError(res, error);
    }
});



export default router;
