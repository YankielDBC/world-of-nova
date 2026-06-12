// @ts-nocheck
import { RUNTIME_CONFIG } from '../lib/runtime-config.js';
import { prisma } from '../lib/db.js';
import { COMMUNITY_PATCH_NOTES } from '../data/community-patches.js';
import { createHash } from 'node:crypto';
let schemaReadyPromise = null;
const DIVIDER = '\u2727\u2550\u2550\u2550\u2022\u2022\u2550\u2550\u2550\u2727';
const MAX_POST_LINE_WIDTH = 30;
function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
function getUpdatesChannel() {
    return String(RUNTIME_CONFIG.communityUpdatesChannel || RUNTIME_CONFIG.merchantAlertsChannel || '@rpgalert').trim();
}
async function ensureCommunityUpdatesSchema() {
    if (!schemaReadyPromise) {
        schemaReadyPromise = (async () => {
            await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "CommunityAnnouncement" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "slug" TEXT NOT NULL UNIQUE,
          "channel" TEXT NOT NULL,
          "messageId" INTEGER,
          "contentHash" TEXT,
          "postedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
            try {
                await prisma.$executeRawUnsafe('ALTER TABLE "CommunityAnnouncement" ADD COLUMN "messageId" INTEGER');
            }
            catch {
                // Column already exists.
            }
            try {
                await prisma.$executeRawUnsafe('ALTER TABLE "CommunityAnnouncement" ADD COLUMN "contentHash" TEXT');
            }
            catch {
                // Column already exists.
            }
            await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "idx_community_announcement_channel" ON "CommunityAnnouncement" ("channel", "postedAt")');
        })().catch((error) => {
            schemaReadyPromise = null;
            throw error;
        });
    }
    await schemaReadyPromise;
}
async function getAnnouncementRecord(slug, channel) {
    const rows = await prisma.$queryRawUnsafe('SELECT id, messageId, contentHash FROM "CommunityAnnouncement" WHERE slug = ? AND channel = ? LIMIT 1', slug, channel);
    return rows[0] || null;
}
async function upsertAnnouncementPosted(params) {
    await prisma.$executeRawUnsafe(`INSERT INTO "CommunityAnnouncement" (slug, channel, messageId, contentHash, postedAt)
     VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(slug) DO UPDATE SET
       channel = excluded.channel,
       messageId = COALESCE(excluded.messageId, "CommunityAnnouncement".messageId),
       contentHash = COALESCE(excluded.contentHash, "CommunityAnnouncement".contentHash),
       postedAt = CURRENT_TIMESTAMP`, params.slug, params.channel, typeof params.messageId === 'number' ? params.messageId : null, params.contentHash ?? null);
}
function visibleLen(text) {
    return Array.from(text).length;
}
function splitByWidth(text, width) {
    if (width <= 0) {
        return [text];
    }
    const chars = Array.from(text);
    const chunks = [];
    for (let i = 0; i < chars.length; i += width) {
        chunks.push(chars.slice(i, i + width).join(''));
    }
    return chunks.length > 0 ? chunks : [''];
}
function wrapTextByWidth(raw, width) {
    const text = String(raw || '').trim();
    if (!text) {
        return [];
    }
    const maxWidth = Math.max(6, width);
    const words = text.split(/\s+/).filter(Boolean);
    const lines = [];
    let current = '';
    const pushCurrent = () => {
        if (current) {
            lines.push(current);
            current = '';
        }
    };
    for (const word of words) {
        if (visibleLen(word) > maxWidth) {
            pushCurrent();
            const chunks = splitByWidth(word, maxWidth);
            for (let i = 0; i < chunks.length; i += 1) {
                const chunk = chunks[i];
                if (!chunk)
                    continue;
                if (i < chunks.length - 1) {
                    lines.push(chunk);
                }
                else {
                    current = chunk;
                }
            }
            continue;
        }
        if (!current) {
            current = word;
            continue;
        }
        const candidate = `${current} ${word}`;
        if (visibleLen(candidate) <= maxWidth) {
            current = candidate;
        }
        else {
            lines.push(current);
            current = word;
        }
    }
    if (current) {
        lines.push(current);
    }
    return lines;
}
function wrapWithPrefix(text, firstPrefix, nextPrefix) {
    const prefixWidth = Math.max(visibleLen(firstPrefix), visibleLen(nextPrefix));
    const bodyWidth = Math.max(6, MAX_POST_LINE_WIDTH - prefixWidth);
    const bodyLines = wrapTextByWidth(text, bodyWidth);
    return bodyLines.map((line, index) => `${index === 0 ? firstPrefix : nextPrefix}${line}`);
}
function pushWrappedLine(lines, text) {
    const wrapped = wrapTextByWidth(text, MAX_POST_LINE_WIDTH);
    wrapped.forEach((line) => lines.push(line));
}
function pushWrappedList(lines, items) {
    items.forEach((item, index) => {
        const marker = index === 0 ? '┌ ' : index === items.length - 1 ? '└ ' : '├ ';
        const continuation = '│ ';
        wrapWithPrefix(item, marker, continuation).forEach((line) => lines.push(line));
    });
}
function renderPatchPost(patch) {
    const lines = [];
    pushWrappedLine(lines, `📣 ${patch.version}`);
    pushWrappedLine(lines, patch.title);
    lines.push(DIVIDER);
    pushWrappedLine(lines, `🎮 ${patch.summary}`);
    lines.push('');
    lines.push('🧩 Cambios clave');
    pushWrappedList(lines, patch.bullets);
    if (patch.uiPreview && patch.uiPreview.length > 0) {
        lines.push('');
        lines.push('🖼️ UI preview');
        pushWrappedList(lines, patch.uiPreview);
    }
    if (patch.flowSteps && patch.flowSteps.length > 0) {
        lines.push('');
        lines.push('🕹️ Como se juega');
        patch.flowSteps.forEach((step, idx) => {
            const prefix = `${idx + 1}. `;
            const next = '   ';
            wrapWithPrefix(step, prefix, next).forEach((line) => lines.push(line));
        });
    }
    if (patch.gameplayImpact && patch.gameplayImpact.length > 0) {
        lines.push('');
        lines.push('🔥 Impacto gameplay');
        pushWrappedList(lines, patch.gameplayImpact);
    }
    if (patch.closing) {
        lines.push('');
        wrapWithPrefix(patch.closing, '✨ ', '  ').forEach((line) => lines.push(line));
    }
    lines.push('');
    pushWrappedLine(lines, 'World of Nova Patch Notes');
    return lines.map((line) => escapeHtml(line)).join('\n');
}
function getContentHash(text) {
    return createHash('sha1').update(text, 'utf8').digest('hex');
}
function isMessageNotModifiedError(error) {
    const description = typeof error?.description === 'string'
        ? error.description
        : '';
    return description.toLowerCase().includes('message is not modified');
}
function isMessageMissingError(error) {
    const description = typeof error?.description === 'string'
        ? error.description
        : '';
    const normalized = description.toLowerCase();
    return (normalized.includes('message to edit not found') ||
        normalized.includes('chat not found') ||
        normalized.includes('message id invalid'));
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
async function publishPatchNotes(api, patches) {
    if (!RUNTIME_CONFIG.communityProgressFeedEnabled) {
        return { posted: 0, edited: 0, skipped: patches.length, failed: 0 };
    }
    const channel = getUpdatesChannel();
    if (!channel) {
        return { posted: 0, edited: 0, skipped: patches.length, failed: 0 };
    }
    await ensureCommunityUpdatesSchema();
    let posted = 0;
    let edited = 0;
    let skipped = 0;
    let failed = 0;
    for (const patch of patches) {
        const rendered = renderPatchPost(patch);
        const contentHash = getContentHash(rendered);
        const record = await getAnnouncementRecord(patch.slug, channel);
        if (!record) {
            try {
                const sent = await api.sendMessage(channel, rendered, {
                    disable_web_page_preview: true,
                });
                const messageId = sent && typeof sent === 'object' && 'message_id' in sent
                    ? Number(sent.message_id)
                    : undefined;
                await upsertAnnouncementPosted({
                    slug: patch.slug,
                    channel,
                    messageId,
                    contentHash,
                });
                posted += 1;
                await sleep(900);
            }
            catch (error) {
                failed += 1;
                console.error('❌ Community patch publish error:', patch.slug, error);
            }
            continue;
        }
        if (record.contentHash && record.contentHash === contentHash) {
            skipped += 1;
            continue;
        }
        if (record.messageId && Number.isFinite(record.messageId)) {
            try {
                await api.editMessageText(channel, Number(record.messageId), rendered, {
                    disable_web_page_preview: true,
                });
                await upsertAnnouncementPosted({
                    slug: patch.slug,
                    channel,
                    messageId: Number(record.messageId),
                    contentHash,
                });
                edited += 1;
                await sleep(800);
                continue;
            }
            catch (error) {
                if (isMessageNotModifiedError(error)) {
                    await upsertAnnouncementPosted({
                        slug: patch.slug,
                        channel,
                        messageId: Number(record.messageId),
                        contentHash,
                    });
                    skipped += 1;
                    continue;
                }
                if (!isMessageMissingError(error)) {
                    failed += 1;
                    console.error('❌ Community patch edit error:', patch.slug, error);
                    continue;
                }
            }
        }
        try {
            const sent = await api.sendMessage(channel, rendered, {
                disable_web_page_preview: true,
            });
            const messageId = sent && typeof sent === 'object' && 'message_id' in sent
                ? Number(sent.message_id)
                : undefined;
            await upsertAnnouncementPosted({
                slug: patch.slug,
                channel,
                messageId,
                contentHash,
            });
            posted += 1;
            await sleep(900);
        }
        catch (error) {
            failed += 1;
            console.error('❌ Community patch re-publish error:', patch.slug, error);
        }
    }
    return { posted, edited, skipped, failed };
}
export async function publishCommunityPatchNotes(api) {
    return publishPatchNotes(api, COMMUNITY_PATCH_NOTES);
}
