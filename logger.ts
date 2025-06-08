import winston from 'winston';
import { fileURLToPath } from 'url';
import path from 'path';

// Recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



/**
 * Creates a winston logger with the given name.
 */
export function createLogger(loggerName: string) {

  // Define log directory and log file path
    const logDir = path.resolve(__dirname, './logs');
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
