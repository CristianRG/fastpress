import express, { Application } from "express";
import cors from "cors";
import conf, { initializeConfig } from "@/conf";
import { registerControllers } from "./loader";
import { discovery } from "./discovery";
import { initializePrisma } from "@/common/prisma";

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        if (!origin || conf.ALLOWED_ORIGINS.includes(origin)) callback(null, true);
        else callback(new Error("Not allowed by CORS"), false);
    }
};

const bootstrap = async () => {
    const modules = await discovery();

    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors(corsOptions));

    registerControllers(app, modules);

    return app;
};

const createServer = async (onStart?: (app: Application) => void): Promise<Application> => {
    let app: Application;

    try {
        await initializeConfig();
        initializePrisma();
        app = await bootstrap();
        const port = conf.PORT || 3000;

        app.listen(port, () => {
            console.log(`Amazing! \nYour server is running on port ${port}`);
            if (onStart) onStart(app);
        });
    } catch (error) {
        console.error("Failed to start the server:", error);
        throw error;
    }

    return app;
};

export { createServer };