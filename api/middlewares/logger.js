import winston from 'winston';

import __dirname from '../../config/constant.js';

const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize } = format;

const myFormat = printf(({ level, message, timestamp }) => {
   return `${timestamp} ${level.slice(5, -5)}: ${message}`;
});

const filterOnly = (level) => {
   return format(function (info) {
      if (info.level.substring(5, level.length + 5) === level) return info;
   })();
};

const logger = createLogger({
   level: 'info',
   format: combine(format.splat(), colorize(), timestamp(), myFormat),
   defaultMeta: {
      name: process.env.npm_package_name,
      version: process.env.npm_package_version,
      environment: process.env.ENVIRONMENT,
   },
   transports: [
      new transports.File({ filename: __dirname + '/debug/error.log', level: 'error', format: filterOnly('error') }),
      new transports.File({ filename: __dirname + '/debug/info.log', level: 'info', format: filterOnly('info') }),
      new transports.File({ filename: __dirname + '/debug/warn.log', level: 'warn', format: filterOnly('warn') }),
      new transports.File({ filename: __dirname + '/debug/combined.log' }),
   ],
});

// Chỉ ghi log ra console nếu không phải là môi trường production
if (process.env.NODE_ENV !== 'production') {
   logger.add(
      new transports.Console({
         format: format.simple(),
      })
   );
}

export default logger;
