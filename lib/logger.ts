/**
 * Centralized logging utility
 * Replaces console.log with environment-aware logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (data) {
      return `${prefix} ${message} ${JSON.stringify(data)}`;
    }
    
    return `${prefix} ${message}`;
  }

  private log(level: LogLevel, message: string, data?: any): void {
    const formatted = this.formatMessage(level, message, data);

    // In production, you might want to send logs to a service like:
    // - Sentry
    // - LogRocket
    // - Datadog
    // - CloudWatch
    
    if (this.isProduction) {
      // Only log errors and warnings in production
      if (level === 'error' || level === 'warn') {
        console[level](formatted);
        // TODO: Send to error tracking service
      }
    } else {
      // Log everything in development
      console[level === 'debug' ? 'log' : level](formatted);
    }
  }

  /**
   * Debug level - only in development
   */
  debug(message: string, data?: any): void {
    if (this.isDevelopment) {
      this.log('debug', message, data);
    }
  }

  /**
   * Info level - general information
   */
  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  /**
   * Warning level - something unexpected but not critical
   */
  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  /**
   * Error level - critical issues
   */
  error(message: string, error?: Error | any): void {
    this.log('error', message, error);
    
    // In production, send to error tracking
    if (this.isProduction && typeof window !== 'undefined') {
      // TODO: Integrate with Sentry or similar
      // Sentry.captureException(error);
    }
  }
}

export const logger = new Logger();

// Convenience exports
export const { debug, info, warn, error } = logger;
