import { jsonResponse, errorResponse, getUser, handleOptions } from './utils.js';

export async function onRequestOptions() {
  return handleOptions();
}

// POST /api/task-requests - submit a task request
export async function onRequestPost(context) {
  const { request, env } = context;
  
  const user = await getUser(request, env);
  if (!user) return errorResponse('Unauthorized', 401);
  
  try {
    const { title, priority, details } = await request.json();
    
    if (!title) {
      return errorResponse('Task title is required');
    }
    
    await env.DB.prepare(
      'INSERT INTO task_requests (company_id, title, priority, details, from_email, company_name, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      user.company_id,
      title,
      priority || 'medium',
      details || '',
      user.email,
      user.name,
      'pending'
    ).run();
    
    return jsonResponse({ success: true, message: 'Task request submitted' });
  } catch (err) {
    return errorResponse('Failed to submit task: ' + err.message, 500);
  }
}
