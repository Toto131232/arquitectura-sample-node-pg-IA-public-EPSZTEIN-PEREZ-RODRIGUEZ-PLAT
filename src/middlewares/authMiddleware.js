// [IA]
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';

const responder401 = (res, message) => {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message });
};

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return responder401(res, 'Token no proporcionado.');
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return responder401(res, 'Formato de token inválido.');
    }

    const token = parts[1];
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor.' });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return responder401(res, 'Token expirado.');
        }
        return responder401(res, 'Token inválido.');
    }
};

export default authMiddleware;
