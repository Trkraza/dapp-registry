import pino from 'pino';

// Pino configuration object
export const pinoConfig = {
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  // Conditional transport for pino-pretty for development readability
  // In production, logs will be raw JSON by default.
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
      ignore: 'pid,hostname',
    },
  } : undefined,
};

// Export an instantiated logger for standalone scripts (always real pino)
const logger = pino(pinoConfig);
export default logger;