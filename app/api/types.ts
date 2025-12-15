/**
 * Type definitions for Next.js 15 Route Handlers
 * 
 * In Next.js 15, params is now a Promise that must be awaited.
 * This type ensures type safety while maintaining compatibility.
 */

export interface RouteContext<T = Record<string, string>> {
    params: Promise<T>;
}

export interface ProcenaRouteContext {
    params: Promise<{ id: string }>;
}
