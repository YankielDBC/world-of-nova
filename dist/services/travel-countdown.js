function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function getCountdownStepSeconds(remainingSeconds) {
    if (remainingSeconds >= 60) {
        return 10;
    }
    if (remainingSeconds >= 20) {
        return 5;
    }
    if (remainingSeconds >= 10) {
        return 2;
    }
    return 1;
}
export function formatRemainingTime(seconds) {
    const safe = Math.max(0, Math.ceil(seconds));
    if (safe < 60) {
        return `${safe} sec`;
    }
    const mins = Math.floor(safe / 60);
    const secs = safe % 60;
    return secs === 0 ? `${mins}m` : `${mins}m ${secs}s`;
}
function buildProgressBar(totalSeconds, remainingSeconds, width = 12) {
    const total = Math.max(1, totalSeconds);
    const remaining = Math.max(0, remainingSeconds);
    const elapsed = Math.max(0, total - remaining);
    const ratio = elapsed / total;
    const filled = Math.max(0, Math.min(width, Math.round(ratio * width)));
    const empty = width - filled;
    const percent = Math.round(ratio * 100);
    return `⏳ Progreso: ${'█'.repeat(filled)}${'░'.repeat(empty)} ${percent}%`;
}
function stripCountdownLines(baseText) {
    return baseText
        .split('\n')
        .filter((line) => {
        const trimmed = line.trim();
        return !trimmed.startsWith('🕒') && !trimmed.startsWith('⌛') && !trimmed.startsWith('⏳ Progreso:');
    })
        .join('\n')
        .trim();
}
export function buildCountdownMessage(params) {
    const core = stripCountdownLines(params.baseText);
    return (`${core}\n\n` +
        `${params.etaLabel}: ${formatRemainingTime(params.remainingSeconds)}\n` +
        `${buildProgressBar(params.totalSeconds, params.remainingSeconds)}`);
}
async function runAdaptiveCountdown(totalSeconds, onTick) {
    let remaining = Math.max(0, Math.ceil(totalSeconds));
    while (remaining > 0) {
        const step = Math.min(remaining, getCountdownStepSeconds(remaining));
        await sleep(step * 1000);
        remaining = Math.max(0, remaining - step);
        await onTick(remaining);
    }
}
function isIgnorableTelegramEditError(error) {
    const text = String(error?.message || '').toLowerCase();
    return (text.includes('message is not modified') ||
        text.includes('message to edit not found') ||
        text.includes("message can't be edited") ||
        text.includes('query is too old'));
}
export function startTravelCountdownAnimation(bot, params) {
    if (params.totalSeconds <= 0) {
        return;
    }
    void (async () => {
        let stopped = false;
        let lastRendered = buildCountdownMessage({
            baseText: params.baseText,
            remainingSeconds: params.totalSeconds,
            totalSeconds: params.totalSeconds,
            etaLabel: params.etaLabel,
        });
        await runAdaptiveCountdown(params.totalSeconds, async (remainingSeconds) => {
            if (stopped) {
                return;
            }
            const next = buildCountdownMessage({
                baseText: params.baseText,
                remainingSeconds,
                totalSeconds: params.totalSeconds,
                etaLabel: params.etaLabel,
            });
            if (next === lastRendered) {
                return;
            }
            lastRendered = next;
            try {
                await bot.api.editMessageText(params.chatId, params.messageId, next);
            }
            catch (error) {
                if (isIgnorableTelegramEditError(error)) {
                    stopped = true;
                    return;
                }
                console.error('❌ Countdown edit error:', error);
            }
        });
    })();
}
