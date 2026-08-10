// [IA]
import { StatusCodes } from 'http-status-codes';

export default class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AppError';
    }

    static badRequest(message) {
        return new AppError(StatusCodes.BAD_REQUEST, message);
    }

    static notFound(message) {
        return new AppError(StatusCodes.NOT_FOUND, message);
    }

    static conflict(message) {
        return new AppError(StatusCodes.CONFLICT, message);
    }

    static internal(message = 'Error interno del servidor.') {
        return new AppError(StatusCodes.INTERNAL_SERVER_ERROR, message);
    }

    // [IA]
    static unauthorized(message = 'No autorizado.') {
        return new AppError(StatusCodes.UNAUTHORIZED, message);
    }
}
