import { StatusCodes } from 'http-status-codes';

class RespuestasHelper {
    responderOk = (res, data) => {
        res.status(StatusCodes.OK).json(data);
    }

    responderCreated = (res, data) => {
        res.status(StatusCodes.CREATED).json(data);
    }

    responderBadRequest = (res, mensaje) => {
        return res.status(StatusCodes.BAD_REQUEST).send(mensaje);
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
     * Loguea el error en consola y responde con el mensaje `Error: <mensaje>`.
     * @param {*} status StatusCode a utilizar (por defecto INTERNAL_SERVER_ERROR).
     */
    responderError = (res, error, status = StatusCodes.INTERNAL_SERVER_ERROR) => {
        console.log(error);
        res.status(status).send(`Error: ${error.message}`);
    }
}

export default new RespuestasHelper();
