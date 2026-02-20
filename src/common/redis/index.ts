import { createClient, RedisClientType } from "redis";
import logger from "@/shared/repository/Logger";

let client: RedisClientType | null = null;
let isConnected = false;

async function getRedisClient(): Promise<RedisClientType | null> {
    if (isConnected && client) {
        return client;
    }

    if (!client) {
        try {
            client = createClient({
                socket: {
                    reconnectStrategy: false
                }
            });

            client.on('error', (err) => {
                logger.error(`Redis Client Error: ${err}`);
                isConnected = false;
            });

            await client.connect();
            isConnected = true;
            return client;
        } catch (error) {
            client = null;
            isConnected = false;
            return null;
        }
    }

    return client;
}

async function disconnectRedis() {
    if (client && isConnected) {
        await client.quit();
        client = null;
        isConnected = false;
    }
}

export { getRedisClient, disconnectRedis };
export default getRedisClient;