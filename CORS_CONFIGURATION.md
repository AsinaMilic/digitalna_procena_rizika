# CORS Configuration - Maximum Permissiveness

## 🚀 Overview
This configuration makes your Next.js app accept connections from ANY origin with ANY headers and ANY methods. This is the most permissive CORS setup possible.

## 📁 Files Modified

### 1. `next.config.ts`
- Added global CORS headers for all routes
- Added specific API route CORS headers
- Changed X-Frame-Options from DENY to SAMEORIGIN

### 2. `middleware.ts` (NEW)
- Handles OPTIONS preflight requests automatically
- Adds CORS headers to all requests
- Applies to all routes except static files

### 3. `lib/cors.ts` (NEW)
- Utility functions for CORS handling
- `createCorsResponse()` - Creates CORS-enabled JSON responses
- `handleOptions()` - Handles preflight requests
- `withCors()` - Wrapper for automatic CORS on any handler

### 4. Updated API Routes
- `app/api/procena/[id]/prilog-m/route.ts` - Full CORS support
- `app/api/procena/[id]/risk-selection/route.ts` - Full CORS support

## 🔧 CORS Headers Applied

```javascript
{
  'Access-Control-Allow-Origin': '*',                    // Allow ALL origins
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD, CONNECT, TRACE',
  'Access-Control-Allow-Headers': '*',                   // Allow ALL headers
  'Access-Control-Allow-Credentials': 'true',            // Allow credentials
  'Access-Control-Max-Age': '86400',                     // Cache preflight for 24h
  'Access-Control-Expose-Headers': '*',                  // Expose all headers
  'Vary': 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers'
}
```

## 🎯 What This Enables

✅ **Any Origin**: localhost, production domains, mobile apps, etc.
✅ **Any Method**: GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD, etc.
✅ **Any Headers**: Authorization, Content-Type, custom headers, etc.
✅ **Credentials**: Cookies, authorization headers, etc.
✅ **Preflight Caching**: 24-hour cache for OPTIONS requests
✅ **Mobile Apps**: React Native, Flutter, etc.
✅ **Browser Extensions**: Chrome extensions, etc.
✅ **Development Tools**: Postman, curl, etc.

## 🚨 Security Note

This configuration is EXTREMELY permissive and should be used carefully in production. Consider restricting origins in production:

```javascript
// For production, consider:
'Access-Control-Allow-Origin': 'https://yourdomain.com'
```

## 🔄 How to Apply to Other API Routes

For any new API route, simply:

1. Import the CORS utilities:
```javascript
import { handleOptions, createCorsResponse } from '../../../lib/cors';
```

2. Add OPTIONS handler:
```javascript
export async function OPTIONS() {
  return handleOptions();
}
```

3. Replace `NextResponse.json()` with `createCorsResponse()`:
```javascript
// Before
return NextResponse.json(data, { status: 200 });

// After
return createCorsResponse(data, 200);
```

## 🧪 Testing CORS

Test with curl:
```bash
# Test preflight
curl -X OPTIONS http://localhost:3000/api/procena/1/prilog-m \
  -H "Origin: http://example.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"

# Test actual request
curl -X GET http://localhost:3000/api/procena/1/prilog-m \
  -H "Origin: http://example.com"
```

## ✅ Status

- [x] Global CORS headers in next.config.ts
- [x] Middleware for OPTIONS handling
- [x] CORS utility functions
- [x] Updated prilog-m API route
- [x] Updated risk-selection API route
- [ ] Apply to remaining API routes (optional)

Your app now accepts connections from ANYWHERE with ANY headers! 🌍