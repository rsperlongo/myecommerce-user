import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import Graylog2Transport from 'winston-graylog2';
import TransportStream from 'winston-transport';

const graylogEnabled = process.env.GRAYLOG_ENABLED === 'true';

const graylogTransport = graylogEnabled
  ? new Graylog2Transport({
      level: process.env.LOG_LEVEL || 'info',
      graylog: {
        servers: [
          {
            host: process.env.GRAYLOG_HOST || 'localhost',
            port: Number.parseInt(process.env.GRAYLOG_PORT || '12201', 10),
          },
        ],
        facility: 'mycommerce-user',
      },
      staticMeta: {
        service: 'mycommerce-user',
        environment: process.env.NODE_ENV || 'development',
      },
    })
  : undefined;

const loggerTransports: TransportStream[] = [new transports.Console()];
if (graylogTransport) {
  loggerTransports.push(graylogTransport as unknown as TransportStream);
}

export const applicationLogger = WinstonModule.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  exitOnError: false,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json(),
  ),
  transports: loggerTransports,
});
