// @ts-nocheck
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function getErrorText(error) {
    const anyErr = error;
    const message = typeof anyErr?.message === 'string' ? anyErr.message : '';
    const code = typeof anyErr?.code === 'string' ? anyErr.code : '';
    const meta = typeof anyErr?.meta === 'object' && anyErr.meta ? JSON.stringify(anyErr.meta) : '';
    return `${code} ${message} ${meta}`.toLowerCase();
}
export function isRetryablePrismaError(error) {
    const anyErr = error;
    const code = typeof anyErr?.code === 'string' ? anyErr.code : '';
    if (code === 'P1008' || code === 'P2034') {
        return true;
    }
    const text = getErrorText(error);
    return (text.includes('socket timeout') ||
        text.includes('sqlite_busy') ||
        text.includes('database is locked') ||
        text.includes('timed out'));
}
export async function withPrismaRetry(label, fn, options) {
    const attempts = Math.max(1, options?.attempts ?? 4);
    const baseDelayMs = Math.max(10, options?.baseDelayMs ?? 120);
    const maxDelayMs = Math.max(baseDelayMs, options?.maxDelayMs ?? 2000);
    let lastError;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (!isRetryablePrismaError(error) || attempt >= attempts) {
                throw error;
            }
            const exponential = baseDelayMs * Math.pow(2, attempt - 1);
            const jitter = Math.floor(Math.random() * Math.max(20, Math.floor(baseDelayMs / 2)));
            const waitMs = Math.min(maxDelayMs, exponential + jitter);
            console.warn(`[PRISMA_RETRY] ${label} attempt ${attempt}/${attempts} failed, retrying in ${waitMs}ms`);
            await sleep(waitMs);
        }
    }
    throw lastError instanceof Error ? lastError : new Error(`[PRISMA_RETRY] ${label} failed`);
}
