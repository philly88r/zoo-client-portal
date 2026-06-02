// Shared utilities for Market Nest Client Portal API

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}

// Simple hash matching the frontend hashPw function
export function hashPw(pw) {
  let h = 0;
  for (let i = 0; i < pw.length; i++) {
    h = ((h << 5) - h) + pw.charCodeAt(i);
    h |= 0;
  }
  return 'h_' + Math.abs(h).toString(36);
}

// Parse Authorization: Bearer <token>
// Token format: base64(email:password_hash)
export function parseAuth(request) {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  try {
    const decoded = atob(auth.slice(7));
    const [email, passwordHash] = decoded.split(':');
    return { email, passwordHash };
  } catch {
    return null;
  }
}

// Get user from DB by auth token
export async function getUser(request, env) {
  const auth = parseAuth(request);
  if (!auth) return null;
  const { results } = await env.DB.prepare(
    'SELECT id, email, role, name, company_id FROM users WHERE email = ? AND password_hash = ?'
  ).bind(auth.email, auth.passwordHash).all();
  return results[0] || null;
}

// CORS preflight handler
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export function handleOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
