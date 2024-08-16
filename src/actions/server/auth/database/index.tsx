'use server';

import winston from 'winston';
import NodeCache from 'node-cache';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp, ...metadata }) => {
      let msg = `${timestamp} [${level}] : ${message}`;
      if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
      }
      return msg;
    }),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'database-operations.log' }),
  ],
});

const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

const rateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 1,
});

export interface DatabaseRecord {
  id: string;
  data: Record<string, unknown>;
  lastUpdated: Date;
}

type DatabaseMode = 'get' | 'set' | 'remove' | 'invalidate';

interface DatabaseOperationOptions {
  mode: DatabaseMode;
  id: string;
  record?: DatabaseRecord;
}

export type DatabaseOperationResult = {
  success: boolean;
  message: string;
  record?: DatabaseRecord | null;
};

async function getDatabaseRecord(id: string): Promise<DatabaseRecord | null> {
  logger.debug('Getting database record', { id });
  const cachedRecord = cache.get<DatabaseRecord>(id);
  if (cachedRecord) {
    logger.debug('Record found in cache', { id });
    return cachedRecord;
  }
  // Simulated database fetch
  const record = { id, data: { example: 'data' }, lastUpdated: new Date() };
  cache.set(id, record);
  return record;
}

async function setDatabaseRecord(record: DatabaseRecord): Promise<void> {
  logger.debug('Setting database record', { id: record.id });
  // Simulated database update
  cache.set(record.id, record);
}

async function removeDatabaseRecord(id: string): Promise<void> {
  logger.debug('Removing database record', { id });
  // Simulated database removal
  cache.del(id);
}

export async function databaseOperations(
  options: DatabaseOperationOptions,
): Promise<DatabaseOperationResult> {
  logger.debug('Starting database operation', { mode: options.mode, id: options.id });

  try {
    await rateLimiter.consume(options.id);
  } catch {
    logger.warn('Rate limit exceeded for database operation', {
      id: options.id,
      mode: options.mode,
    });
    return { success: false, message: 'Too many requests. Please try again later.' };
  }

  try {
    switch (options.mode) {
      case 'get': {
        const record = await getDatabaseRecord(options.id);
        return {
          success: true,
          message: record ? 'Record retrieved successfully' : 'Record not found',
          record,
        };
      }
      case 'set':
        if (!options.record) {
          throw new Error('Record is required for set operation');
        }
        await setDatabaseRecord(options.record);
        return { success: true, message: 'Record set successfully', record: options.record };
      case 'remove':
        await removeDatabaseRecord(options.id);
        return { success: true, message: 'Record removed successfully' };
      case 'invalidate':
        cache.del(options.id);
        return { success: true, message: 'Token invalidated in cache' };
      default:
        throw new Error(`Invalid operation mode: ${options.mode}`);
    }
  } catch (error) {
    logger.error('Error in database operation', {
      id: options.id,
      mode: options.mode,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { success: false, message: 'Database operation failed' };
  }
}

export function clearDatabaseCache(id: string): void {
  cache.del(id);
  logger.debug('Cleared cache for database record', { id });
}

logger.info('Database operations module initialized');

export default databaseOperations;
