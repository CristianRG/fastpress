import { dirname } from "path";
import { fileURLToPath } from "url";

const __fileName = fileURLToPath(import.meta.url);
const __dirName = dirname(__fileName);

export { __dirName, __fileName };