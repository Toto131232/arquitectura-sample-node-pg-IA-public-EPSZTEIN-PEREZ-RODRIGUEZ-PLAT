import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import CursosService from './../services/cursos-service.js'
import respuestasHelper from '../helpers/respuestas-helper.js';

const router = Router();
const currentService = new CursosService();

router.get('', async (req, res) => {
    try {
        console.log(`CursosController.get`);
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
        let id = req.params.id;
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
        respuestasHelper.responderError(res, error, StatusCodes.BAD_REQUEST);
    }
});

router.put('/:id', async (req, res) => {
    try {
        let id = parseInt(req.params.id);
        let entity = req.body;

        if (entity.id && parseInt(entity.id) !== id) {
            return respuestasHelper.responderBadRequest(res, `El id de la URL (${id}) no coincide con el id del body (${entity.id}).`);
        }

        entity.id = id;
        const rowsAffected = await currentService.updateAsync(entity);
        if (rowsAffected != 0){
            respuestasHelper.responderOk(res, rowsAffected);
        } else {
            respuestasHelper.responderNotFound(res, id);
        }
    } catch (error) {
        respuestasHelper.responderError(res, error, StatusCodes.BAD_REQUEST);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        let id = req.params.id;
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
