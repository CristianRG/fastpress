import { Logger } from "@/shared/models/Logger";

interface ServerConfig {
    port?: number;
    allowedOrigins?: string[];
    env?: string;
    logger?: Logger;
    prismaAdapter: any;
}

interface JWTConfig {
    secret?: string;
    algorithm: "HS256" | "RS256";
    jwt_exp?: number;
    refresh_exp?: number;
}

interface InternalConfig {
    server: ServerConfig;
    jwt?: JWTConfig;
}

function defineFastPressConfig(config: InternalConfig): InternalConfig {
    return config;
}

export { defineFastPressConfig, InternalConfig };