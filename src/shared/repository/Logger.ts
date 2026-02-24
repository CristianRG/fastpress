import conf from "@/conf";
import { Logger as LoggerModel, LogLevel } from "../models/Logger";

class DefaultLogger extends LoggerModel {

    log(message: string): void {
        console.log(this.formatMessage("log", message));
    }
    info(message: string): void {
        console.info(this.formatMessage("info", message));
    }
    error(message: string): void {
        console.error(this.formatMessage("error", message));
    }
    warn(message: string): void {
        console.warn(this.formatMessage("warn", message));
    }
    debug(message: string): void {
        console.debug(this.formatMessage("debug", message));
    }

    private formatMessage(level: LogLevel, message: string): string {
        const timestamp = new Date().toISOString();
        return `${timestamp} - [${level.toUpperCase()}]: ${message}`;
    }
}

/**
 * A simple Logger class that can be extended or replaced with different logging implementations.
 * It uses the abstract Logger class as a base and delegates logging to an instance of ILogger, which can be customized.
 * By default, it uses the DefaultLogger implementation that logs to the console with timestamps and log levels.
 */
class Logger extends LoggerModel {
    private logger: LoggerModel = new DefaultLogger();
    static instance: Logger;

    private constructor() {
        super();
    }

    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    setLogger(logger: LoggerModel) {
        this.logger = logger;
    }

    getLogger() {
        return this.logger;
    }

    log(message: string): void {
        this.logger.log(message);
    }
    info(message: string): void {
        this.logger.info(message);
    }
    error(message: string): void {
        this.logger.error(message);
    }
    warn(message: string): void {
        this.logger.warn(message);
    }
    debug(message: string): void {
        this.logger.debug(message);
    }
}

const logger = Logger.getInstance();
logger.setLogger(conf.LOGGER_INSTANCE ? new DefaultLogger() : conf.LOGGER_INSTANCE);
export default logger;