import { glob } from "glob";
import path from "path";
import { pathToFileURL } from "url";
import { __dirName, __fileName } from "./utility";

export const discovery = async () => {

    // Determine the file extension based on the current file's extension (either .ts or .js)
    const extension = __fileName.endsWith(".js") ? "js" : "ts";
    const controllersPath = path.resolve(__dirName, "../../modules");
    const internalControllerPaths = path.resolve(__dirName, "../modules");

    const controllers = await glob(`${controllersPath}/**/**.controller.${extension}`);
    const internalControllers = await glob(`${internalControllerPaths}/**/**.controller.${extension}`);

    const modules = [];

    for (const controllerPath of internalControllers) {

        const absolutePath = path.resolve(controllerPath);
        const fileURL = pathToFileURL(absolutePath).href;
        const module = await import(fileURL);

        if (module.default) {
            modules.push(module.default);
        }
    }

    for (const controllerPath of controllers) {
        
        const absolutePath = path.resolve(controllerPath);
        const fileURL = pathToFileURL(absolutePath).href;
        const module = await import(fileURL);

        if (module.default) {
            modules.push(module.default);
        }
    }

    return modules;
}