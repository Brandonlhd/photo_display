const JWT_SECRET = typeof env !== 'undefined' ? null : null;

function getJwtSecret(env) {
  return env.JWT_SECRET || 'photo-display-jwt-secret-2024';
}

function makeResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

// Simple JWT implementation (no external deps)
function base64url(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function createJWT(payload, secret) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify(payload));
  const signatureInput = `${header}.${body}`;
  const key = new TextEncoder().encode(secret);
  // Use subtle crypto available in Workers
  return crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    .then(k => crypto.subtle.sign('HMAC', k, new TextEncoder().encode(signatureInput)))
    .then(sig => {
      const sigB64 = base64url(String.fromCharCode(...new Uint8Array(sig)));
      return `${header}.${body}.${sigB64}`;
    });
}

function verifyJWT(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const signatureInput = `${header}.${body}`;
  const key = new TextEncoder().encode(secret);
  return crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'])
    .then(k => crypto.subtle.verify('HMAC', k,
      Uint8Array.from(atob(signature.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)),
      new TextEncoder().encode(signatureInput)))
    .then(valid => {
      if (!valid) return null;
      try {
        const payload = JSON.parse(atob(body.replace(/-/g, '+').replace(/_/g, '/')));
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
        return payload;
      } catch { return null; }
    });
}

function parseFolderName(name) {
  const match = name.match(/^(\d{4})(\d{2})(\d{2})\s+(.+)$/);
  if (match) {
    return { date: `${match[1]}-${match[2]}-${match[3]}`, title: match[4] };
  }
  return { date: '', title: name };
}

// Generate presigned URL for R2 object (manual construction)
function generatePresignedUrl(bucketName, objectKey, endpoint, accessKeyId, secretAccessKey, expiresIn = 3600) {
  const now = Math.floor(Date.now() / 1000);
  const expires = now + expiresIn;
  const dateStamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z/, 'Z');
  const shortDate = dateStamp.slice(0, 8);

  // S3 presigned URL v2 — simpler and works with R2
  const encodedKey = objectKey.split('/').map(s => encodeURIComponent(s)).join('/');
  const url = new URL(`/${bucketName}/${encodedKey}`, endpoint);
  url.searchParams.set('X-Amz-Algorithm', 'AWS4-HMAC-SHA256');
  url.searchParams.set('X-Amz-Credential', `${accessKeyId}/${shortDate}/auto/s3/aws4_request`);
  url.searchParams.set('X-Amz-Date', dateStamp);
  url.searchParams.set('X-Amz-Expires', String(expiresIn));
  url.searchParams.set('X-Amz-SignedHeaders', 'host');

  const host = url.host;
  const canonicalHeaders = `host:${host}\n`;
  const signedHeaders = 'host';
  const canonicalQueryString = [...url.searchParams.entries()]
    .map(([k, v]) => [encodeURIComponent(k), encodeURIComponent(v)].join('='))
    .sort().join('&');
  const canonicalRequest = [
    'GET',
    `/${bucketName}/${encodedKey}`,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    'UNSIGNED-PAYLOAD',
  ].join('\n');

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    dateStamp,
    `${shortDate}/auto/s3/aws4_request`,
    sha256Hex(canonicalRequest),
  ].join('\n');

  // We'll compute this in the handler using crypto.subtle
  return { url: url.href, stringToSign, shortDate, dateStamp };
}

async function hmacSha256(key, data) {
  const k = typeof key === 'string' ? new TextEncoder().encode(key) : key;
  const cryptoKey = await crypto.subtle.importKey('raw', k, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data));
  return sig;
}

async function getSignatureKey(secretKey, dateStamp, region, service) {
  const kDate = await hmacSha256(`AWS4${secretKey}`, dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  const kSigning = await hmacSha256(kService, 'aws4_request');
  return kSigning;
}

function sha256Hex(data) {
  // For Workers, we'll compute this async. Return placeholder for sync use.
  // Actually we need to do this differently — compute everything async
  return data; // will be replaced
}

// Full async presigned URL generation
async function createPresignedUrl(bucketName, objectKey, endpoint, accessKeyId, secretAccessKey, expiresIn = 3600) {
  const now = new Date();
  const dateStamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z/, 'Z');
  const shortDate = dateStamp.slice(0, 8);

  const encodedKey = objectKey.split('/').map(s => encodeURIComponent(s)).join('/');
  const url = new URL(`/${bucketName}/${encodedKey}`, endpoint);
  url.searchParams.set('X-Amz-Algorithm', 'AWS4-HMAC-SHA256');
  url.searchParams.set('X-Amz-Credential', `${accessKeyId}/${shortDate}/auto/s3/aws4_request`);
  url.searchParams.set('X-Amz-Date', dateStamp);
  url.searchParams.set('X-Amz-Expires', String(expiresIn));
  url.searchParams.set('X-Amz-SignedHeaders', 'host');

  const host = url.host;
  const canonicalHeaders = `host:${host}\n`;
  const signedHeaders = 'host';
  const canonicalQueryString = [...url.searchParams.entries()]
    .map(([k, v]) => [encodeURIComponent(k), encodeURIComponent(v)].join('='))
    .sort().join('&');
  const canonicalRequest = [
    'GET',
    `/${bucketName}/${encodedKey}`,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    'UNSIGNED-PAYLOAD',
  ].join('\n');

  // SHA-256 of canonical request
  const hashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalRequest));
  const hashHex = [...new Uint8Array(hashBuf)].map(b => b.toString(16).padStart(2, '0')).join('');

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    dateStamp,
    `${shortDate}/auto/s3/aws4_request`,
    hashHex,
  ].join('\n');

  const signingKey = await getSignatureKey(secretAccessKey, shortDate, 'auto', 's3');
  const sigBuf = await crypto.subtle.sign('HMAC',
    await crypto.subtle.importKey('raw', signingKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']),
    new TextEncoder().encode(stringToSign)
  );
  const signature = [...new Uint8Array(sigBuf)].map(b => b.toString(16).padStart(2, '0')).join('');

  url.searchParams.set('X-Amz-Signature', signature);
  return url.href;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // POST /api/login
    if (url.pathname === '/api/login' && request.method === 'POST') {
      try {
        const { username, password } = await request.json();
        if (username === env.ADMIN_USER && password === env.ADMIN_PASS) {
          const token = await createJWT(
            { sub: username, exp: Math.floor(Date.now() / 1000) + 86400 },
            getJwtSecret(env)
          );
          return makeResponse({ token }, 200, corsHeaders);
        }
        return makeResponse({ error: '用户名或密码错误' }, 401, corsHeaders);
      } catch (e) {
        return makeResponse({ error: '请求格式错误' }, 400, corsHeaders);
      }
    }

    // GET /api/photos — requires JWT
    if (url.pathname === '/api/photos' && request.method === 'GET') {
      const authHeader = request.headers.get('Authorization') || '';
      const token = authHeader.replace('Bearer ', '');
      const payload = await verifyJWT(token, getJwtSecret(env));
      if (!payload) {
        return makeResponse({ error: '未授权' }, 401, corsHeaders);
      }

      // List all R2 objects
      const listed = await env.R2.list({ limit: 1000 });
      const objects = listed.objects;

      // Group by folder
      const photos = [];
      let id = 1;
      for (const obj of objects) {
        const key = obj.key;
        const folderName = key.split('/')[0];
        const fileName = key.split('/').pop();
        if (!fileName || fileName === folderName) continue;

        const { date, title: albumTitle } = parseFolderName(folderName);

        // Generate presigned URL
        const presignedUrl = await createPresignedUrl(
          env.R2_BUCKET_NAME || 'photo-display',
          key,
          `https://${env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
          env.R2_ACCESS_KEY_ID,
          env.R2_SECRET_ACCESS_KEY,
          3600
        );

        photos.push({
          id: id++,
          filename: fileName,
          category: folderName,
          albumTitle,
          date,
          src: presignedUrl,
        });
      }

      return makeResponse({ photos }, 200, corsHeaders);
    }

    return makeResponse({ error: 'Not found' }, 404, corsHeaders);
  },
};
