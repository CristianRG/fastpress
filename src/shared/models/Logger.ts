interface ILogger {
    log(message: string): void;
    info(message: string): void;
    error(message: string): void;
    warn(message: string): void;
    debug(message: string): void;
}

type LogLevel = "log" | "info" | "error" | "warn" | "debug";

/**
 * Logger is an abstract class that defines the structure for creating loggers in the application. It implements the ILogger interface, which specifies methods for logging messages at different levels (log, info, error, warn, debug). Any class that extends Logger must implement these methods to provide the actual logging functionality, such as writing to the console, a file, or an external logging service.
 */
abstract class Logger implements ILogger {
    abstract log(message: string): void;
    abstract info(message: string): void;
    abstract error(message: string): void;
    abstract warn(message: string): void;
    abstract debug(message: string): void;
}

export { Logger, ILogger, LogLevel };