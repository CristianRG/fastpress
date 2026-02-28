import { resolve } from 'path';
import { existsSync } from 'fs';
import { pathToFileURL } from 'url';
import createJiti from 'jiti';
import { InternalConfig } from './config';

const defaultConfig = {
    PORT: parseInt(process.env.PORT || '3000'),
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
    JWT_SECRET: process.env.JWT_SECRET || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    ENV: process.env.NODE_ENV || 'development',
    ALGORITHM: 'HS256' as 'HS256' | 'RS256',
    JWT_EXPIRATION: 15 * 60 * 1000, // 15 minutes
    RJWT_EXPIRATION: 7 * 24 * 60 * 60 * 1000, // 7 days
    LOGGER_INSTANCE: null as any,
    PRISMA_ADAPTER: null as any,
    CONTROLLERS_PATH: "src"
}

const conf = { ...defaultConfig };
let isConfigLoaded = false;

function printConfigDetails() {
    console.log(`\n================== FastPress Configuration =================`);
    console.log(`PORT: ${conf.PORT}`);
    console.log(`ENV: ${conf.ENV}`);
    console.log(`============================================================`);
}

async function loadUserConfig() {
    const possibleExtensions = ['.ts', '.js', '.mjs', '.cjs'];
    const jiti = createJiti(import.meta.url);

    for (const ext of possibleExtensions) {
        const configPath = resolve(process.cwd(), `fastpress.config${ext}`);
        
        if (existsSync(configPath)) {
            try {
                const configUrl = pathToFileURL(configPath).href;
                const userConfigModule = await jiti.import(configUrl, { default: true });
                return userConfigModule as InternalConfig;
            } catch (error) {
                console.warn(`Failed to load fastpress.config${ext}:`, error);
                continue;
            }
        }
    }

    console.log('No fastpress.config.ts found. Using default configuration.');
    return undefined;
}

export async function initializeConfig() {
    if (isConfigLoaded) {
        return conf;
    }

    const userConfig = await loadUserConfig();

    if (userConfig) {
        conf.PORT = userConfig.server?.port ?? defaultConfig.PORT;
        conf.ALLOWED_ORIGINS = userConfig.server?.allowedOrigins ?? defaultConfig.ALLOWED_ORIGINS;
        conf.JWT_SECRET = userConfig.jwt?.secret ?? defaultConfig.JWT_SECRET;
        conf.ENV = userConfig.server?.env ?? defaultConfig.ENV;
        conf.ALGORITHM = userConfig.jwt?.algorithm ?? defaultConfig.ALGORITHM;
        conf.JWT_EXPIRATION = userConfig.jwt?.jwt_exp ?? defaultConfig.JWT_EXPIRATION;
        conf.RJWT_EXPIRATION = userConfig.jwt?.refresh_exp ?? defaultConfig.RJWT_EXPIRATION;
        conf.LOGGER_INSTANCE = userConfig.server?.logger ?? defaultConfig.LOGGER_INSTANCE;
        conf.PRISMA_ADAPTER = userConfig.server?.prismaAdapter ?? defaultConfig.PRISMA_ADAPTER;
        conf.CONTROLLERS_PATH = userConfig.server?.controllersPath ?? defaultConfig.CONTROLLERS_PATH;
        printConfigDetails();
    }

    isConfigLoaded = true;
    return conf;
}

export default conf;