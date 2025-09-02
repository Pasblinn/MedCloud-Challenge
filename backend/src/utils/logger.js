const winston = require('winston');

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};
1
winston.addColors(logColors);

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    if (info.stack) {
      return `${info.timestamp} ${info.level}: ${info.message}\n${info.stack}`;
    }
    return `${info.timestamp} ${info.level}: ${info.message}`;
  })
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: logFormat,
  }),
];

// Add file transports only in production
if (process.env.NODE_ENV === 'production') {
  transports.push(
    // File transport for errors
    new winston.transports.File({
      filename: '/app/logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: '/app/logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: logLevels,
  transports,
  exitOnError: false,
  exceptionHandlers: process.env.NODE_ENV === 'production' ? [
    new winston.transports.File({ filename: '/app/logs/exceptions.log' }),
  ] : [
    new winston.transports.Console()
  ],
  rejectionHandlers: process.env.NODE_ENV === 'production' ? [
    new winston.transports.File({ filename: '/app/logs/rejections.log' }),
  ] : [
    new winston.transports.Console()
  ],
});


module.exports = logger;