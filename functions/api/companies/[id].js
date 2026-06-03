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
      'SELECT id, name, slug, industry, description, email, google_drive_url, fundraiser_text, fundraiser_status, ai_landing_html FROM companies WHERE id = ?'
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

// PUT /api/companies/[id] - toggle task status or update fundraiser text
export async function onRequestPut(context) {
  const { request, env } = context;
  const companyId = context.params.id;
  
  const user = await getUser(request, env);
  if (!user) return errorResponse('Unauthorized', 401);
  
  if (user.role === 'client' && user.company_id !== parseInt(companyId)) {
    return errorResponse('Forbidden', 403);
  }
  
  try {
    const body = await request.json();
    const { taskId, status, fundraiser_text, fundraiser_status } = body;
    
    if (taskId && status) {
      await env.DB.prepare(
        'UPDATE company_tasks SET status = ? WHERE id = ? AND company_id = ?'
      ).bind(status, taskId, companyId).run();
      return jsonResponse({ success: true });
    }
    
    if (fundraiser_text !== undefined) {
      await env.DB.prepare(
        'UPDATE companies SET fundraiser_text = ? WHERE id = ?'
      ).bind(fundraiser_text, companyId).run();
      return jsonResponse({ success: true });
    }
    
    if (fundraiser_status !== undefined) {
      if (fundraiser_status === 'submitted') {
        try {
          const { results: compDetails } = await env.DB.prepare(
            'SELECT name, slug, description, fundraiser_text FROM companies WHERE id = ?'
          ).bind(companyId).all();
          
          if (compDetails.length > 0) {
            const companyInfo = compDetails[0];
            const rawText = companyInfo.fundraiser_text || companyInfo.description || '';
            
            console.log('Invoking Cloudflare Workers AI to generate landing page HTML...');
            const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
              messages: [
                {
                  role: "system",
                  content: "You are an elite, modern front-end web designer. You create exceptionally clean, gorgeous, responsive custom HTML sections for fundraiser landing pages. Keep typography elegant (using clean fonts, Josefin Sans, Inter), use luxurious coffee brand colors (deep warm dark browns, charcoal #1a1414, gold #d4af37, and white). Include custom headings, beautifully styled grids, timeline callouts, and fundraising goals. Return ONLY the raw HTML body (including <style> block for custom classes). Do NOT wrap in ```html or any markdown blocks. Return strictly raw HTML."
                },
                {
                  role: "user",
                  content: `Create a custom, high-end HTML section for our coffee fundraiser.\n\nOrganization Name: ${companyInfo.name}\n\nClient Description of Fundraiser:\n${rawText}`
                }
              ]
            });
            
            if (aiResponse && aiResponse.response) {
              const cleanedHtml = aiResponse.response.replace(/^```html\s*/i, '').replace(/```\s*$/i, '').trim();
              await env.DB.prepare(
                'UPDATE companies SET fundraiser_status = ?, ai_landing_html = ? WHERE id = ?'
              ).bind(fundraiser_status, cleanedHtml, companyId).run();
              return jsonResponse({ success: true, ai_generated: true });
            }
          }
        } catch (aiErr) {
          console.error('⚠️ Cloudflare Workers AI failed:', aiErr.message);
        }
      }

      await env.DB.prepare(
        'UPDATE companies SET fundraiser_status = ? WHERE id = ?'
      ).bind(fundraiser_status, companyId).run();
      return jsonResponse({ success: true });
    }
    
    return errorResponse('taskId and status, fundraiser_text, or fundraiser_status is required', 400);
  } catch (err) {
    return errorResponse('Failed to update: ' + err.message, 500);
  }
}
