import { Pipe } from "./Pipe";
import { Context } from "@/shared/models/Context";
import { ServerResponse } from "@/shared/models/ServerResponse";

export class ParseIntPipe extends Pipe<string, number> {

    transform(value: string, ctx: Context): number {
        const parsed = parseInt(value, 10);
        
        if (isNaN(parsed)) {
            throw new ServerResponse(400, `Validation failed: "${value}" is not an integer`);
        }
        
        return parsed;
    }
}
