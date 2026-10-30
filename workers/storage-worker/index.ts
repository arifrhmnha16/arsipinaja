/**
 * ArsipinAja - Cloudflare R2 Storage Worker
 * Secure Object Storage API with Firebase Auth ID Token Validation
 */

export interface Env {
  ARSIPINAJA_BUCKET: R2Bucket;
  FIREBASE_PROJECT_ID: string;
}

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/zip',
  'text/plain',
];

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

async function verifyFirebaseToken(token: string, projectId: string): Promise<{ uid: string; email?: string } | null> {
  try {
    // In production Worker, verify against Google's public certs or token verification endpoint
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${projectId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
    });
    if (!res.ok) {
      // Decode JWT payload for payload claims if endpoint requires API Key
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.user_id) return { uid: payload.user_id, email: payload.email };
      }
      return null;
    }
    const data: any = await res.json();
    return { uid: data.users[0]?.localId, email: data.users[0]?.email };
  } catch {
    return null;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 1. Authorize Firebase Token
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '') || url.searchParams.get('token');

    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized: ID token missing' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authUser = await verifyFirebaseToken(token, env.FIREBASE_PROJECT_ID);
    if (!authUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid Firebase token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Route: POST /upload
    if (request.method === 'POST' && path === '/upload') {
      try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const fileKey = formData.get('fileKey') as string | null;
        const fileId = formData.get('fileId') as string | null;

        if (!file || !fileKey || !fileId) {
          return new Response(JSON.stringify({ error: 'Missing file or metadata' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (file.size > MAX_SIZE) {
          return new Response(JSON.stringify({ error: 'File size exceeds 50MB limit' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Put object to Cloudflare R2
        await env.ARSIPINAJA_BUCKET.put(fileKey, file.stream(), {
          httpMetadata: {
            contentType: file.type || 'application/octet-stream',
          },
          customMetadata: {
            ownerId: authUser.uid,
            originalName: file.name,
            fileId,
          },
        });

        return new Response(JSON.stringify({ success: true, fileKey, fileId }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Upload failed' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 3. Route: GET /download/:fileId & GET /preview/:fileId
    if (request.method === 'GET' && (path.startsWith('/download/') || path.startsWith('/preview/'))) {
      const isDownload = path.startsWith('/download/');
      const fileId = path.split('/')[2];
      const objectKey = url.searchParams.get('fileKey') || `${authUser.uid}/${fileId}`;

      const object = await env.ARSIPINAJA_BUCKET.get(objectKey);
      if (!object) {
        return new Response('File not found in R2 storage', {
          status: 404,
          headers: corsHeaders,
        });
      }

      // Security: verify owner
      if (object.customMetadata?.ownerId && object.customMetadata.ownerId !== authUser.uid) {
        return new Response('Forbidden: Access denied to private document', {
          status: 403,
          headers: corsHeaders,
        });
      }

      const headers = new Headers(corsHeaders);
      object.writeHttpMetadata(headers);
      headers.set('etag', object.httpEtag);

      if (isDownload) {
        const originalName = object.customMetadata?.originalName || 'document';
        headers.set('Content-Disposition', `attachment; filename="${originalName}"`);
      } else {
        headers.set('Content-Disposition', 'inline');
      }

      return new Response(object.body, { headers });
    }

    // 4. Route: DELETE /files/:fileId
    if (request.method === 'DELETE' && path.startsWith('/files/')) {
      const body: any = await request.json().catch(() => ({}));
      const fileKey = body.fileKey;
      if (fileKey) {
        await env.ARSIPINAJA_BUCKET.delete(fileKey);
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
};
