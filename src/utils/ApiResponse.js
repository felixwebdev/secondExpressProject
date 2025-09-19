export default class ApiResponse {
    static success(res, data, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({
            code: statusCode,
            message,
            data
        });
    }   
    static error(res, message = 'Error', statusCode = 500) {
        return res.status(statusCode).json({
            code: statusCode,
            message
        });
    }
    static badRequest(res, message = 'Bad Request') {
        return this.error(res, message, 400);
    }

    static unauthorized(res, message = 'Unauthorized') {
        return this.error(res, message, 401);
    }
}