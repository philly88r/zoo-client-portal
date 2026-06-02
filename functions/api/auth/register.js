import { jsonResponse, errorResponse, hashPw, handleOptions } from '../utils.js';

export async function onRequestOptions() {
  return handleOptions();
}

// POST /api/auth/register
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return errorResponse('Email and password are required');
    }
    
    if (password.length < 6) {
      return errorResponse('Password must be at least 6 characters');
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if user exists
    const { results: existing } = await env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(normalizedEmail).all();
    
    if (existing.length > 0) {
      return errorResponse('Email already registered');
    }
    
    const passwordHash = hashPw(password);
    
    const { results } = await env.DB.prepare(
      'INSERT INTO users (email, password_hash, role, name) VALUES (?, ?, ?, ?) RETURNING id, email, role, name'
    ).bind(normalizedEmail, passwordHash, 'admin', 'Admin').run();
    
    const user = results[0];
    const token = btoa(`${user.email}:${passwordHash}`);
    
    return jsonResponse({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        companyId: null,
      },
      token,
    });
  } catch (err) {
    return errorResponse('Registration failed: ' + err.message, 500);
  }
}
