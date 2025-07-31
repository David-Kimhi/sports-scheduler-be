import cliProgress from 'cli-progress';
import type { Logger } from 'winston';

/**
 * Runs a loop with a progress bar, logging progress to console and file.
 * @param items Array or number (for range 0..N)
 * @param task Function to run for each item (can be async)
 * @param logger Winston logger for file + console logging
 * @param label Optional label for the progress bar
 */
export async function runWithProgress<T>(
    items: T[] | number,
    task: (item: T, index: number) => Promise<void> | void,
    logger: Logger,
    label = 'Processing'
) {
    const arr: T[] = Array.isArray(items)
        ? items
        : Array.from({ length: items }, (_, i) => i as unknown as T);

    const total = arr.length;
    const bar = new cliProgress.SingleBar({
        format: `${label} |{bar}| {percentage}% || {value}/{total}`,
        clearOnComplete: false,
        hideCursor: true
    }, cliProgress.Presets.shades_classic);

    bar.start(total, 0);

    for (let i = 0; i < total; i++) {
        await task(arr[i], i);
        bar.update(i + 1);

        // Log at milestones (every 10% to avoid spam)
        const percent = Math.floor(((i + 1) / total) * 100);
        if (percent % 10 === 0 || i === total - 1) {
            logger.info(`${label}: ${percent}% (${i + 1}/${total})`);
        }
    }

    bar.stop();
    logger.info(`${label} completed (${total} items).`);
}
