// [IA]
import { StatusCodes } from 'http-status-codes';
import AppError from './app-error.js';

class RespuestasHelper {
    responderOk = (res, data) => {
        res.status(StatusCodes.OK).json(data);
    }

    responderCreated = (res, data) => {
        res.status(StatusCodes.CREATED).json(data);
    }

    responderBadRequest = (res, mensaje) => {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: mensaje });
    }

    responderBadRequestJson = (res, data) => {
        res.status(StatusCodes.BAD_REQUEST).json(data);
    }

    responderNotFound = (res, id) => {
        res.status(StatusCodes.NOT_FOUND).send(`No se encontro la entidad (id:${id}).`);
    }

    responderInternalError = (res, mensaje) => {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(mensaje);
    }

    /**
     * Loguea el error en consola y responde con un mensaje seguro para el cliente.
     */
    responderError = (res, error) => {
        console.log(error);
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor.' });
    }
}

export default new RespuestasHelper();
