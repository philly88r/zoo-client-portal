import { jsonResponse, errorResponse, getUser, handleOptions } from '../utils.js';

export async function onRequestOptions() {
  return handleOptions();
}

// GET /api/companies/[id] - full company detail with updates and tasks
export async function onRequestGet(context) {
  const { request, env } = context;
  const companyId = context.params.id;
  
  const user = await getUser(request, env);
  if (!user) return errorResponse('Unauthorized', 401);
  
  // Clients can only see their own company
  if (user.role === 'client' && user.company_id !== parseInt(companyId)) {
    return errorResponse('Forbidden', 403);
  }
  
  try {
    // Company info
    const { results: companies } = await env.DB.prepare(
      'SELECT id, name, slug, industry, description, email FROM companies WHERE id = ?'
    ).bind(companyId).all();
    
    if (companies.length === 0) return errorResponse('Company not found', 404);
    const company = companies[0];
    
    // Social
    const { results: social } = await env.DB.prepare(
      'SELECT platform, account_name FROM company_social WHERE company_id = ?'
    ).bind(companyId).all();
    
    // Stats
    const { results: statsRows } = await env.DB.prepare(
      'SELECT posts, published, scheduled, followers FROM company_stats WHERE company_id = ?'
    ).bind(companyId).all();
    
    // Updates
    const { results: updates } = await env.DB.prepare(
      'SELECT id, date, published, impressions, highlights FROM company_updates WHERE company_id = ? ORDER BY date DESC'
    ).bind(companyId).all();
    
    // Tasks
    const { results: tasks } = await env.DB.prepare(
      'SELECT id, title, status, priority, created_at FROM company_tasks WHERE company_id = ? ORDER BY created_at DESC'
    ).bind(companyId).all();
    
    return jsonResponse({
      success: true,
      company: {
        ...company,
        social: Object.fromEntries(social.map(s => [s.platform, s.account_name])),
        stats: statsRows[0] || { posts: 0, published: 0, scheduled: 0, followers: 0 },
        updates: updates.map(u => ({ ...u, highlights: JSON.parse(u.highlights || '[]') })),
        tasks,
      },
    });
  } catch (err) {
    return errorResponse('Failed to load company: ' + err.message, 500);
  }
}

// PUT /api/companies/[id] - toggle task status
export async function onRequestPut(context) {
  const { request, env } = context;
  const companyId = context.params.id;
  
  const user = await getUser(request, env);
  if (!user) return errorResponse('Unauthorized', 401);
  
  if (user.role === 'client' && user.company_id !== parseInt(companyId)) {
    return errorResponse('Forbidden', 403);
  }
  
  try {
    const { taskId, status } = await request.json();
    
    if (!taskId || !status) {
      return errorResponse('taskId and status are required');
    }
    
    await env.DB.prepare(
      'UPDATE company_tasks SET status = ? WHERE id = ? AND company_id = ?'
    ).bind(status, taskId, companyId).run();
    
    return jsonResponse({ success: true });
  } catch (err) {
    return errorResponse('Failed to update task: ' + err.message, 500);
  }
}
