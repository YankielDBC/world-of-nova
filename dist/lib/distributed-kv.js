import { createClient } from 'redis';
class MemoryKvStore {
    store = new Map();
    get(key) {
        const now = Date.now();
        const entry = this.store.get(key);
        if (!entry) {
            return null;
        }
        if (entry.expiresAt && entry.expiresAt <= now) {
            this.store.delete(key);
            return null;
        }
        return entry.value;
    }
    set(key, value, ttlSeconds) {
        const expiresAt = ttlSeconds && Number.isFinite(ttlSeconds) && ttlSeconds > 0
            ? Date.now() + Math.floor(ttlSeconds * 1000)
            : null;
        this.store.set(key, { value, expiresAt });
    }
    del(key) {
        this.store.delete(key);
    }
}
const memoryStore = new MemoryKvStore();
let redisClient = null;
let redisInitAttempted = false;
async function getRedisClient() {
    if (redisClient) {
        return redisClient;
    }
    if (redisInitAttempted) {
        return null;
    }
    redisInitAttempted = true;
    const url = (process.env.REDIS_URL || '').trim();
    if (!url) {
        return null;
    }
    try {
        const client = createClient({ url });
        client.on('error', (error) => {
            console.error('Redis error:', error);
        });
        await client.connect();
        redisClient = client;
        return redisClient;
    }
    catch (error) {
        console.error('Redis init failed, using memory fallback:', error);
        return null;
    }
}
function withNamespace(namespace, key) {
    return `${namespace}:${key}`;
}
export async function kvGet(namespace, key) {
    const namespaced = withNamespace(namespace, key);
    const redis = await getRedisClient();
    if (redis) {
        return redis.get(namespaced);
    }
    return memoryStore.get(namespaced);
}
export async function kvSet(namespace, key, value, ttlSeconds) {
    const namespaced = withNamespace(namespace, key);
    const redis = await getRedisClient();
    if (redis) {
        if (ttlSeconds && Number.isFinite(ttlSeconds) && ttlSeconds > 0) {
            await redis.set(namespaced, value, { EX: Math.floor(ttlSeconds) });
            return;
        }
        await redis.set(namespaced, value);
        return;
    }
    memoryStore.set(namespaced, value, ttlSeconds);
}
export async function kvDel(namespace, key) {
    const namespaced = withNamespace(namespace, key);
    const redis = await getRedisClient();
    if (redis) {
        await redis.del(namespaced);
        return;
    }
    memoryStore.del(namespaced);
}
export async function kvGetJson(namespace, key) {
    const raw = await kvGet(namespace, key);
    if (!raw) {
        return null;
    }
    try {
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
export async function kvSetJson(namespace, key, value, ttlSeconds) {
    await kvSet(namespace, key, JSON.stringify(value), ttlSeconds);
}
