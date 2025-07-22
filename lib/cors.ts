import { NextResponse } from 'next/server';

// CORS headers for maximum compatibility - VERY PERMISSIVE
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD, CONNECT, TRACE',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Expose-Headers': '*',
  'Vary': 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers',
};

// Add CORS headers to any response
export function addCorsHeaders(response: NextResponse): NextResponse {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// Create a CORS-enabled response
export function createCorsResponse(data: any, status: number = 200): NextResponse {
  const response = NextResponse.json(data, { status });
  return addCorsHeaders(response);
}

// Handle OPTIONS preflight requests
export function handleOptions(): NextResponse {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// Wrapper function to automatically add CORS to any API handler
export function withCors(handler: Function) {
  return async (...args: any[]) => {
    try {
      const response = await handler(...args);
      if (response instanceof NextResponse) {
        return addCorsHeaders(response);
      }
      return response;
    } catch (error) {
      console.error('API Error:', error);
      return createCorsResponse({ error: 'Internal Server Error' }, 500);
    }
  };
}