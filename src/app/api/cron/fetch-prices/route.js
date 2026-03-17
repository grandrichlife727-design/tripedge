// src/app/api/cron/fetch-prices/route.js
// Vercel Cron wrapper — add to vercel.json:
// { "crons": [{ "path": "/api/cron/fetch-prices", "schedule": "0 */2 * * *" }] }

export { GET } from '../../../../../cron/fetch-prices';
