import conf from "@/conf";
import { glob } from "glob";
import path from "path";
import { pathToFileURL } from "url";
import createJiti from "jiti";

export const discovery = async () => {
    // Search for controllers in the user's project directory
    const userProjectRoot = process.cwd();
    const controllersPath = conf.CONTROLLERS_PATH || "src";
    const searchPath = path.join(userProjectRoot, controllersPath);
    
    // Determine which extensions to search based on the path
    // If looking in dist/build, only .js files (compiled), otherwise .ts (source)
    const isCompiledPath = controllersPath === 'dist' || controllersPath === 'build';
    const possibleExtensions = isCompiledPath ? ['js', 'mjs', 'cjs'] : ['ts'];
    
    const modules = [];
    const jiti = createJiti(import.meta.url, {
        interopDefault: true
    });

    for (const ext of possibleExtensions) {
        // Normalize path for glob (use forward slashes even on Windows)
        const controllerPattern = path.join(searchPath, `modules/**/*.controller.${ext}`).replace(/\\/g, '/');
        const controllers = await glob(controllerPattern, {
            ignore: ['**/node_modules/**']
        });

        for (const controllerPath of controllers) {
            try {
                const absolutePath = path.resolve(controllerPath);
                
                let module;
                // Use jiti for .ts files to support TypeScript decorators
                if (ext === 'ts') {
                    module = await jiti.import(absolutePath, { default: true });
                } else {
                    // Native import for compiled .js/.mjs/.cjs
                    const fileURL = pathToFileURL(absolutePath).href;
                    module = await import(fileURL);
                }

                if (module.default) {
                    modules.push(module.default);
                } else if (module) {
                    modules.push(module);
                }
            } catch (error) {
                console.warn(`Failed to load controller ${controllerPath}:`, error);
            }
        }
    }

    return modules;
}