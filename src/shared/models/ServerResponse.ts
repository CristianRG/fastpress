/**
 * Class representing a server response.
 * It includes a status code, an optional message, and optional data.
 */
export class ServerResponse {
    statusCode: number;
    message?: string;
    data?: any;

    constructor(statusCode: number, message?: string, data?: any) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }
}