-- Market Nest Client Portal - Seed Data
-- Run after schema.sql

-- Companies
INSERT INTO companies (id, name, slug, industry, description, email, google_drive_url, fundraiser_text) VALUES
(1, 'Burnette Tools', 'burnette-tools', 'Industrial Manufacturing — Carbide Cutting Tools', 'Professional-grade carbide cutting tools for B2B industrial manufacturing. CNC tooling, saw blades, router bits.', 'burnette-tools@portal.local', NULL, NULL),
(2, 'Vow Launch', 'vow-launch', 'Wedding Planning — DIY & Budget', 'DIY wedding planning tips, budget hacks, and luxury aesthetics for engaged couples.', 'vow-launch@portal.local', NULL, NULL),
(3, 'Market Nest', 'market-nest', 'Marketing Agency — Lead Gen & Automation', 'Agency growth, lead generation, and marketing automation for marketing agencies.', 'market-nest@portal.local', NULL, NULL),
(4, 'ProTech Carpet Care', 'protech-carpet-care', 'Carpet Cleaning & Restoration', 'Professional carpet cleaning. Greensboro/Triad NC. Deep fiber steam extraction specialists.', 'protech-carpet-care@portal.local', NULL, NULL),
(5, 'RDKR (Red Kicks)', 'rdkr-red-kicks', 'E-Commerce — Fashion', 'E-commerce shoe and fashion brand. Store at redikicks.com.', 'rdkr-red-kicks@portal.local', NULL, NULL),
(6, 'Liberty Beans Coffee', 'liberty-beans-coffee', 'Specialty Coffee — Roast, Blend & Fundraiser', 'Premium specialty coffee. Medium roast, dark roast, decaf, flavored blends. Fundraiser coffee supporting community organizations. libertybeanscoffee.com', 'liberty-beans-coffee@portal.local', 'https://drive.google.com/drive/folders/1edBApZ_UlG2BpGYR45xQT8BJ0ivrlnEO?usp=drive_link', NULL),
(7, 'Carbide Saws Inc.', 'carbide-saws', 'Industrial Manufacturing — Saw Blade Sharpening & Repair', 'Saw blade manufacturing, sharpening, and repair since 1954. Authorized Freud service center. High Point, NC.', 'carbide-saws@portal.local', NULL, NULL);

-- Users (admin + client accounts)
-- Passwords use the same hashPw JS function: simple hash for demo
-- admin password: admin88 -> hash needs to match frontend
INSERT INTO users (id, email, password_hash, role, name, company_id) VALUES
(1, 'admin@marketnest.com', 'h_admin_hash', 'admin', 'Admin', NULL),
(2, 'burnette-tools@portal.local', 'h_client_hash', 'client', 'Burnette Tools', 1),
(3, 'vow-launch@portal.local', 'h_client_hash', 'client', 'Vow Launch', 2),
(4, 'market-nest@portal.local', 'h_client_hash', 'client', 'Market Nest', 3),
(5, 'protech-carpet-care@portal.local', 'h_client_hash', 'client', 'ProTech Carpet Care', 4),
(6, 'rdkr-red-kicks@portal.local', 'h_client_hash', 'client', 'RDKR (Red Kicks)', 5),
(7, 'liberty-beans-coffee@portal.local', 'h_client_hash', 'client', 'Liberty Beans Coffee', 6),
(8, 'carbide-saws@portal.local', 'h_client_hash', 'client', 'Carbide Saws Inc.', 7);

-- Social accounts
INSERT INTO company_social (company_id, platform, account_name) VALUES
(1, 'facebook', 'Burnette Tools'),
(1, 'linkedin', 'Burnette Tools'),
(1, 'twitter', '@d_hanx'),
(2, 'facebook', 'Vow Launch'),
(2, 'linkedin', 'Vow Launch'),
(3, 'facebook', 'Market Nest'),
(3, 'linkedin', 'Market Nest'),
(4, 'facebook', 'ProTech Carpet Care'),
(6, 'facebook', 'Liberty Beans Coffee'),
(7, 'facebook', 'Carbide Saws Inc.');

-- Company stats
INSERT INTO company_stats (company_id, posts, published, scheduled, followers) VALUES
(1, 47, 42, 5, 1240),
(2, 38, 35, 3, 890),
(3, 25, 22, 3, 410),
(4, 52, 50, 2, 530),
(5, 12, 12, 0, 320),
(6, 363, 363, 0, 0),
(7, 1, 1, 0, 0);

-- Company updates
INSERT INTO company_updates (company_id, date, published, impressions, highlights) VALUES
(1, '2026-06-01', 4, 4800, '["SEO Automation: successfully compiled 2.2K-word long-form B2B article targeting amana tool cnc router bits and deployed production build live to burnettetools.com","Carbide sharpening post hit 2.3K reach","CMT vs Freud comparison got 95 saves"]'),
(1, '2026-05-31', 2, 3400, '["Blade life extension shared 38 times","Cost-per-hour insert analysis"]'),
(1, '2026-05-30', 3, 5200, '["CNC automation reach: 3.5K","Burnette Tools at 1,240 followers"]'),
(2, '2026-06-01', 3, 6500, '["SEO daily automation configured in Agent OS & Obsidian","Grounded reverse-engineered 2.2K-word blog published targeting free wedding budget calculator","Champagne wall hack viral: 4.8K reach"]'),
(2, '2026-05-31', 3, 6000, '["Friday wedding savings shared 72 times","DIY floral tutorial"]'),
(2, '2026-05-30', 2, 4500, '["Budget wedding guide saved 50 times","Vow Launch at 890 followers"]'),
(3, '2026-05-28', 1, 1800, '["LinkedIn automation guide: 1.2K views"]'),
(4, '2026-06-01', 3, 2000, '["SEO automation pipeline configured (WP REST API)","First article published: allergy relief carpet cleaning (Post #2596)","Technical SEO audit running daily with auto-fixes","Allergy season post: 1.1K reach"]'),
(4, '2026-05-31', 2, 2400, '["Before/after transformation shared 52 times"]'),
(4, '2026-05-30', 2, 1700, '["220°F steam extraction education post"]'),
(5, '2026-05-25', 1, 450, '["New product launch post"]'),
(6, '2026-06-01', 1, 0, '["SEO automation pipeline configured (WP REST API + SEOPress)","First article published: coffee and health benefits 2026 (Post #29446)","Technical SEO audit: 363 posts scanned, many missing SEOPress meta detected","Daily cron job scheduled for 9:00 AM"]'),
(7, '2026-06-01', 1, 0, '["SEO automation pipeline configured in Agent OS & Obsidian","First article generated: industrial band saw blade sharpening (15.9KB)","116 technical SEO fixes applied across 38 files","Site deployed live to carbidesawsinc.com via Netlify"]');

-- Company tasks
INSERT INTO company_tasks (company_id, title, status, priority) VALUES
(1, 'CMT vs Freud video comparison', 'pending', 'high'),
(1, 'Blog: Carbide Science 101', 'draft', 'medium'),
(1, 'Q3 product launch schedule', 'pending', 'medium'),
(2, 'Set up Agent OS & Obsidian daily SEO automation pipeline', 'completed', 'high'),
(2, '10 Under-$500 Wedding Hacks carousel', 'pending', 'high'),
(2, 'Champagne wall tutorial video', 'pending', 'high'),
(2, 'Venue partner outreach', 'pending', 'medium'),
(3, 'Case study writeup', 'draft', 'medium'),
(3, 'Email follow-up sequence', 'pending', 'medium'),
(4, 'SEO automation pipeline setup', 'completed', 'high'),
(4, 'Daily blog generation via WP REST API', 'completed', 'high'),
(4, 'Summer cleaning promotion', 'pending', 'high'),
(4, 'Before/after video series', 'pending', 'high'),
(4, 'Google Business posts setup', 'pending', 'medium'),
(5, 'Instagram shopping setup', 'pending', 'high'),
(5, 'Summer collection campaign', 'pending', 'medium'),
(6, 'SEO automation pipeline setup', 'completed', 'high'),
(6, 'Daily blog generation via WP REST API', 'completed', 'high'),
(6, 'Fix missing SEOPress meta on 363 existing posts', 'in_progress', 'high'),
(6, 'Google Business Profile optimization', 'pending', 'medium'),
(7, 'SEO automation pipeline setup', 'completed', 'high'),
(7, 'Daily blog generation running', 'completed', 'high'),
(7, 'Location page schema markup', 'pending', 'medium'),
(7, 'Google Business Profile optimization', 'pending', 'medium');
