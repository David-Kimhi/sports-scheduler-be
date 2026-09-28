import type { Logger } from "winston";
import { safeSerialize } from "./safeSerialize.js";

function formatDuration(ms: number): string {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${ms} ms (${minutes} min ${seconds.toFixed(2)} s)`;
  } else {
    return `${ms} ms (${seconds.toFixed(2)} s)`;
  }
}


/*
Wrapper function for logging with type passed - synch tasks
*/
export function withLogging<T extends (...args: any[]) => any>(
  fn: T,
  logger: Logger
): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    const fnName = fn.name || "anonymous";
    logger.info(`▶️ Calling ${fnName} with args: ${safeSerialize(args)}`);
    const start = performance.now();

    try {
        const result = fn(...args);
        const end = performance.now();
        const duration = formatDuration(end - start);
        logger.info(`⏱️ ${fnName} took ${duration}`);
        return result;
      } catch (err: any) {
        const end = performance.now();
        const duration = formatDuration(end - start);
        logger.error(`⛔ ${fnName} failed after ${duration}`, {
          error: err?.message,
          stack: err?.stack,
        });
        throw err;
      }
  }) as T;
}

/*
Wrapper function for logging with type passed - asynch tasks
*/
export function withAsyncLogging<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    logger: Logger
  ): T {
    return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      const fnName = fn.name || "anonymous";
      const start = performance.now();
  
      logger.info(`▶️ Calling ${fnName} with args: ${safeSerialize(args)}`);
  
      try {
        const result = await fn(...args);
        const end = performance.now();
        const duration = formatDuration(end - start);
        logger.info(`⏱️ ${fnName} took ${duration}`);
        return result;
      } catch (err: any) {
        const end = performance.now();
        const duration = formatDuration(end - start);
        logger.error(`⛔ ${fnName} failed after ${duration}`, {
          error: err?.message,
          stack: err?.stack,
        });
        throw err;
      }
    }) as T;
  }