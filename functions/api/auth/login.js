import { jsonResponse, errorResponse, hashPw, getUser, handleOptions } from '../utils.js';

export async function onRequestOptions() {
  return handleOptions();
}

// POST /api/auth/login
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return errorResponse('Email and password are required');
    }
    
    const passwordHash = hashPw(password);
    
    const { results } = await env.DB.prepare(
      'SELECT id, email, role, name, company_id FROM users WHERE email = ? AND password_hash = ?'
    ).bind(email.toLowerCase().trim(), passwordHash).all();
    
    const user = results[0];
    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }
    
    // Return user info + auth token (base64 email:hash)
    const token = btoa(`${user.email}:${passwordHash}`);
    
    return jsonResponse({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        companyId: user.company_id,
      },
      token,
    });
  } catch (err) {
    return errorResponse('Login failed: ' + err.message, 500);
  }
}
