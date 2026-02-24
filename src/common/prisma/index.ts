import conf from "@/conf";
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | null = null;

export function initializePrisma() {
    if (!prisma) {
        if (!conf.PRISMA_ADAPTER) {
            throw new Error('Prisma adapter not configured. Make sure to call createServer() before using Prisma.');
        }
        prisma = new PrismaClient({ adapter: conf.PRISMA_ADAPTER });
    }
    return prisma;
}

export function getPrisma(): PrismaClient {
    if (!prisma) {
        return initializePrisma();
    }
    return prisma;
}

const prismaProxy = new Proxy({} as PrismaClient, {
    get(target, prop) {
        const instance = getPrisma();
        const value = (instance as any)[prop];
        return typeof value === 'function' ? value.bind(instance) : value;
    }
});

export default prismaProxy;