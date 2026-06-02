import { jsonResponse, errorResponse, handleOptions } from './utils.js';

export async function onRequestOptions() {
  return handleOptions();
}

// POST /api/sync - sync SEO automation results from cron jobs
// Requires SYNC_SECRET header for authentication
export async function onRequestPost(context) {
  const { request, env } = context;
  
  // Verify sync secret
  const syncSecret = request.headers.get('X-Sync-Secret');
  if (!syncSecret || syncSecret !== env.SYNC_SECRET) {
    return errorResponse('Invalid sync secret', 403);
  }
  
  try {
    const data = await request.json();
    const { action } = data;
    
    switch (action) {
      case 'add_update': {
        const { company_id, date, published, impressions, highlights } = data;
        if (!company_id || !date) {
          return errorResponse('company_id and date are required');
        }
        
        await env.DB.prepare(
          'INSERT INTO company_updates (company_id, date, published, impressions, highlights) VALUES (?, ?, ?, ?, ?)'
        ).bind(
          company_id,
          date,
          published || 0,
          impressions || 0,
          JSON.stringify(highlights || [])
        ).run();
        
        // Update company stats
        await env.DB.prepare(
          'UPDATE company_stats SET posts = posts + ?, published = published + ? WHERE company_id = ?'
        ).bind(published || 0, published || 0, company_id).run();
        
        return jsonResponse({ success: true, message: 'Update added' });
      }
      
      case 'update_task': {
        const { task_id, status } = data;
        if (!task_id || !status) {
          return errorResponse('task_id and status are required');
        }
        
        await env.DB.prepare(
          'UPDATE company_tasks SET status = ? WHERE id = ?'
        ).bind(status, task_id).run();
        
        return jsonResponse({ success: true, message: 'Task updated' });
      }
      
      case 'add_task': {
        const { company_id, title, status, priority } = data;
        if (!company_id || !title) {
          return errorResponse('company_id and title are required');
        }
        
        await env.DB.prepare(
          'INSERT INTO company_tasks (company_id, title, status, priority) VALUES (?, ?, ?, ?)'
        ).bind(company_id, title, status || 'pending', priority || 'medium').run();
        
        return jsonResponse({ success: true, message: 'Task added' });
      }
      
      case 'update_stats': {
        const { company_id, posts, published, scheduled, followers } = data;
        if (!company_id) {
          return errorResponse('company_id is required');
        }
        
        await env.DB.prepare(
          'UPDATE company_stats SET posts = ?, published = ?, scheduled = ?, followers = ? WHERE company_id = ?'
        ).bind(posts || 0, published || 0, scheduled || 0, followers || 0, company_id).run();
        
        return jsonResponse({ success: true, message: 'Stats updated' });
      }
      
      default:
        return errorResponse('Unknown action. Supported: add_update, update_task, add_task, update_stats');
    }
  } catch (err) {
    return errorResponse('Sync failed: ' + err.message, 500);
  }
}

// GET /api/sync - health check
export async function onRequestGet(context) {
  const { request, env } = context;
  const syncSecret = request.headers.get('X-Sync-Secret');
  if (!syncSecret || syncSecret !== env.SYNC_SECRET) {
    return errorResponse('Invalid sync secret', 403);
  }
  
  return jsonResponse({ success: true, message: 'Market Nest sync API is live' });
}
