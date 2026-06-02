import { jsonResponse, errorResponse, getUser, handleOptions } from '../utils.js';

export async function onRequestOptions() {
  return handleOptions();
}

// GET /api/companies - list all companies (admin) or single company (client)
export async function onRequestGet(context) {
  const { request, env } = context;
  
  const user = await getUser(request, env);
  if (!user) return errorResponse('Unauthorized', 401);
  
  try {
    let companies;
    
    if (user.role === 'admin') {
      const { results } = await env.DB.prepare(
        'SELECT id, name, slug, industry, description, email FROM companies ORDER BY id'
      ).all();
      companies = results;
    } else {
      const { results } = await env.DB.prepare(
        'SELECT id, name, slug, industry, description, email FROM companies WHERE id = ?'
      ).bind(user.company_id).all();
      companies = results;
    }
    
    // Enrich each company with social, stats, latest update, pending task count
    const enriched = await Promise.all(companies.map(async (c) => {
      // Social accounts
      const { results: social } = await env.DB.prepare(
        'SELECT platform, account_name FROM company_social WHERE company_id = ?'
      ).bind(c.id).all();
      
      // Stats
      const { results: statsRows } = await env.DB.prepare(
        'SELECT posts, published, scheduled, followers FROM company_stats WHERE company_id = ?'
      ).bind(c.id).all();
      const stats = statsRows[0] || { posts: 0, published: 0, scheduled: 0, followers: 0 };
      
      // Latest update
      const { results: latestUpdates } = await env.DB.prepare(
        'SELECT date, published, impressions, highlights FROM company_updates WHERE company_id = ? ORDER BY date DESC LIMIT 1'
      ).bind(c.id).all();
      const latest = latestUpdates[0] ? {
        ...latestUpdates[0],
        highlights: JSON.parse(latestUpdates[0].highlights || '[]'),
      } : null;

      // Recent updates (last 5)
      const { results: recentUpdates } = await env.DB.prepare(
        'SELECT date, published, impressions, highlights FROM company_updates WHERE company_id = ? ORDER BY date DESC LIMIT 5'
      ).bind(c.id).all();
      const recent = recentUpdates.map(u => ({
        ...u,
        highlights: JSON.parse(u.highlights || '[]')
      }));
      
      // Pending task count
      const { results: taskCount } = await env.DB.prepare(
        "SELECT COUNT(*) as count FROM company_tasks WHERE company_id = ? AND status != 'completed'"
      ).bind(c.id).all();
      
      return {
        ...c,
        social: Object.fromEntries(social.map(s => [s.platform, s.account_name])),
        stats,
        latestUpdate: latest,
        recentUpdates: recent,
        pendingTasks: taskCount[0].count,
      };
    }));
    
    return jsonResponse({ success: true, companies: enriched });
  } catch (err) {
    return errorResponse('Failed to load companies: ' + err.message, 500);
  }
}
