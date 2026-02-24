import { Context } from "../models/Context";
import { Middleware } from "../models/Middleware";

class Sanitizer extends Middleware {

    handle(ctx: Context): void | Promise<void> {
        const url = ctx.req.url;
        ctx.req.url = this.sanitizeUrl(url);
        ctx.query = this.santitizeQuery(ctx.query);
        ctx.next();
    }

    private sanitizeUrl(url: string): string {
        if (!url) return url;

        let sanitizedUrl = url.replace(/\0/g, '');
        sanitizedUrl = decodeURIComponent(sanitizedUrl);
        while (this.detectTraversal(sanitizedUrl)) {
            sanitizedUrl = sanitizedUrl.replace(/(\.\.\/|%2e%2e%2f|\.{2}\\|%2e%2e%5c)/gi, '');
        }
        return sanitizedUrl;
    }

    private santitizeQuery (query: any): Map<string, string> | undefined {
        if (!query) return query;
        const formatedQuery = Object.entries(query).map(([key, value]) => ({ key, value }));
        let sanitizedQuery = new Map<string, string>();

        for (const { key, value } of formatedQuery) {
            const sanitizedKey = key.replace(/\0/g, '');
            const sanitizedValue = typeof value === 'string' ? value.replace(/\0/g, '') : value;
            sanitizedQuery.set(sanitizedKey, sanitizedValue as string);

            const decodedKey = decodeURIComponent(sanitizedKey);
            const decodedValue = typeof sanitizedValue === 'string' ? decodeURIComponent(sanitizedValue) : sanitizedValue;
            sanitizedQuery.set(decodedKey, decodedValue as string);

            if (this.detectTraversal(decodedKey)) {
                sanitizedQuery.delete(decodedKey);
            }
            if (this.detectTraversal(decodedValue as string)) {
                sanitizedQuery.delete(decodedKey);
            }
        }
        
        return sanitizedQuery;
    }

    private detectTraversal(url: string): boolean {
        const traversalPatterns = [/(\.\.\/)/, /(%2e%2e%2f)/i, /(\.\.\\)/, /(%2e%2e%5c)/i];
        return traversalPatterns.some(pattern => pattern.test(url));
    }
}

export { Sanitizer };