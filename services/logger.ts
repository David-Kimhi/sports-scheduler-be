import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { YYYY_MM_DD } from '../helpers.js';
import { BASE_PATH } from '../config.js';

/**
 * Creates a winston logger with the given name.
 */
export function createLogger(module: string, sport: string) {
    // Define log directory and log file path
    const logDir = path.resolve(BASE_PATH, './logs');
    const loggerName = `${YYYY_MM_DD}_${module}_${sport}`

    // Ensure the logs directory exists
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    const logFilePath = path.join(logDir, `${loggerName}.log`);

    const logger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(
            winston.format.label({ label: loggerName }),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(({ timestamp, level, message, label }) => {
                return `${timestamp} [${label}] ${level}: ${message}`;
            })
        ),
        transports: [
            new winston.transports.File({ filename: logFilePath }),
            new winston.transports.Console()
        ]
    });

    return logger;
}
