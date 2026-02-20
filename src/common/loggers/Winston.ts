import conf from "@/conf";
import { Logger } from "@/shared/models/Logger";
import winston from "winston";

const defaultFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} - [${level}]: ${message}`;
    })
);

const defaultTransports = [
    conf.ENV === 'production' ? new winston.transports.File({ filename: "logs/combined.log" }) : new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
];

interface WinstonLoggerConfig {
    format?: winston.Logform.Format;
    transports?: winston.transport[];
}

class WinstonLogger extends Logger {
    winstonLogger: winston.Logger;

    constructor(config?: WinstonLoggerConfig) {
        super();
        this.winstonLogger = winston.createLogger({
            level: conf.ENV === 'production' ? 'info' : 'debug',
            format: config?.format ?? defaultFormat,
            transports: config?.transports ?? defaultTransports,
        });
    }

    log(message: string): void {
        this.winstonLogger.info(message);
    }
    info(message: string): void {
        this.winstonLogger.info(message);
    }
    error(message: string): void {
        this.winstonLogger.error(message);
    }
    warn(message: string): void {
        this.winstonLogger.warn(message);
    }
    debug(message: string): void {
        this.winstonLogger.debug(message);
    }
}

export { WinstonLogger };