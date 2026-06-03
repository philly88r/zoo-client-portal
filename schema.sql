-- Market Nest Client Portal - D1 Schema
-- Cloudflare D1 (SQLite)

DROP TABLE IF EXISTS task_requests;
DROP TABLE IF EXISTS company_tasks;
DROP TABLE IF EXISTS company_updates;
DROP TABLE IF EXISTS company_social;
DROP TABLE IF EXISTS company_stats;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client',  -- 'admin' or 'client'
  name TEXT NOT NULL,
  company_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  industry TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  google_drive_url TEXT DEFAULT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE company_social (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  platform TEXT NOT NULL,
  account_name TEXT NOT NULL,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  UNIQUE(company_id, platform)
);

CREATE TABLE company_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL UNIQUE,
  posts INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 0,
  scheduled INTEGER NOT NULL DEFAULT 0,
  followers INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE company_updates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  published INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  highlights TEXT NOT NULL DEFAULT '[]',  -- JSON array of strings
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE company_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, in_progress, completed, draft
  priority TEXT NOT NULL DEFAULT 'medium', -- high, medium, low
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE task_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  title TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  details TEXT NOT NULL DEFAULT '',
  from_email TEXT NOT NULL DEFAULT '',
  company_name TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
