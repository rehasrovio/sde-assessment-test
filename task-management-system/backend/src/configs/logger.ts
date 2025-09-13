import winston, {
  LoggerOptions,
  createLogger,
  format,
  transports,
} from "winston";
import moment from "moment";

export interface Log {
  message: string;
  action: string;
  eventTimestamp?: number;
  error?: Error;
  context?: any;
}

export interface RequestLog {
  message: string;
  action: string;
  eventTimestamp?: number;
  error?: Error;
  context?: any;
  requestId: string;
}

export interface GenericErrorType {
  message: string;
  eventTimestamp?: number;
  error: Error;
}

export class Logger {
  name = "Logger";
  logger!: winston.Logger;
  private static instance: Logger;
  private isInitialized = false;
  private requestId: string | null = null;

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public initialize = (configId: string): void => {
    if (this.isInitialized) {
      return; // Already initialized
    }

    const loggerConfig: LoggerOptions = {
      level: "info",
      format: format.combine(
        format.label({ label: "Logger" }),
        format.timestamp(),
        format.json()
      ),
      transports: [new transports.Console()],
    };

    this.logger = createLogger(loggerConfig);
    this.isInitialized = true;

    this.logger.info(
      `Initialized ${this.name} with configId: ${JSON.stringify(configId)}`
    );
  };

  // Request ID management
  public setRequestId = (requestId: string): void => {
    this.requestId = requestId;
  };

  public getRequestId = (): string | null => {
    return this.requestId;
  };

  public clearRequestId = (): void => {
    this.requestId = null;
  };

  public logEvent = ({
    message,
    action,
    eventTimestamp = moment().unix(),
    error,
    context,
  }: Log): void => {
    const log = {
      logEvent: {
        message,
        action,
        eventTimestamp,
        requestId: this.requestId,
      },
      error,
      context,
    };

    if (error) {
      this.logger.error(log);
    } else {
      this.logger.info(log);
    }
  };

  public logRequestEvent = ({
    message,
    action,
    eventTimestamp = moment().unix(),
    error,
    context,
  }: RequestLog): void => {
    const log = {
      logEvent: {
        message,
        action,
        eventTimestamp,
        requestId: this.requestId,
      },
      error,
      context,
    };

    if (error) {
      this.logger.error(log);
    } else {
      this.logger.info(log);
    }
  };

  public logGenericErrorEvent = ({
    message,
    eventTimestamp = moment().unix(),
    error,
  }: GenericErrorType): void => {
    const log = {
      logEvent: {
        message,
        eventTimestamp,
        requestId: this.requestId,
      },
      error,
    };
    this.logger.error(log);
  };
}

// Export singleton instance
export const logger = Logger.getInstance();
