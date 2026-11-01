/**
 * Structured JSON logger for SST Home Solutions.
 *
 * Outputs newline-delimited JSON so log aggregators (Datadog, CloudWatch,
 * Loki, Sentry breadcrumbs) can parse fields without regex.
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.info('Properties fetched', { count: 12, city: 'Noida' });
 *   logger.error('DB connection failed', err);
 *
 *   // With a request-scoped child logger that auto-attaches requestId:
 *   const log = logger.child({ requestId: req.headers.get('x-request-id') });
 *   log.info('Handling request');
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_NUM: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const IS_TEST = process.env.NODE_ENV === 'test';

// In production only emit warn+ to keep log volume low and cost down.
// In development/test emit everything.
const MIN_LEVEL: LogLevel = IS_PRODUCTION ? 'warn' : 'debug';

function serializeError(err: unknown): Record<string, unknown> | undefined {
  if (!err) return undefined;
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: IS_PRODUCTION ? undefined : err.stack,
    };
  }
  if (typeof err === 'object') return err as Record<string, unknown>;
  return { raw: String(err) };
}

function emit(
  level: LogLevel,
  message: string,
  data?: unknown,
  context?: Record<string, unknown>
): void {
  if (LEVEL_NUM[level] < LEVEL_NUM[MIN_LEVEL]) return;
  if (IS_TEST) return; // silence in unit tests

  const entry: Record<string, unknown> = {
    ts: new Date().toISOString(),
    level,
    msg: message,
    service: 'sst-home-solutions',
    env: process.env.NODE_ENV,
    ...context,
  };

  if (data !== undefined) {
    if (data instanceof Error || (data && typeof data === 'object' && 'message' in (data as object) && 'stack' in (data as object))) {
      entry.err = serializeError(data);
    } else {
      entry.data = data;
    }
  }

  const line = JSON.stringify(entry);

  // Route to appropriate stdio stream
  if (level === 'error' || level === 'warn') {
    process.stderr.write(line + '\n');
  } else {
    process.stdout.write(line + '\n');
  }

  // Forward errors to Sentry when DSN is configured (server-side safe)
  if (level === 'error' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    try {
      // Dynamic require avoids issues when @sentry/nextjs is not installed
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Sentry = require('@sentry/nextjs');
      if (data instanceof Error) {
        Sentry.captureException(data, { extra: { message, ...context } });
      } else {
        Sentry.captureMessage(message, { level: 'error', extra: { data, ...context } });
      }
    } catch {
      /* Sentry not available — ignore */
    }
  }
}

class Logger {
  private context: Record<string, unknown>;

  constructor(context: Record<string, unknown> = {}) {
    this.context = context;
  }

  /** Create a child logger that merges additional context into every entry. */
  child(extraContext: Record<string, unknown>): Logger {
    return new Logger({ ...this.context, ...extraContext });
  }

  debug(message: string, data?: unknown): void {
    emit('debug', message, data, this.context);
  }

  info(message: string, data?: unknown): void {
    emit('info', message, data, this.context);
  }

  warn(message: string, data?: unknown): void {
    emit('warn', message, data, this.context);
  }

  error(message: string, data?: unknown): void {
    emit('error', message, data, this.context);
  }

  /** Convenience: log duration of an async operation. */
  async time<T>(label: string, fn: () => Promise<T>, extra?: Record<string, unknown>): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      this.debug(label, { ...extra, durationMs: Date.now() - start });
      return result;
    } catch (err) {
      this.error(label + ' failed', { ...extra, durationMs: Date.now() - start, err: serializeError(err) });
      throw err;
    }
  }
}

export const logger = new Logger();

// Convenience named exports for direct use
export const { debug, info, warn, error } = logger;
