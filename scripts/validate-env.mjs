import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const envPath = path.join(root, '.env.local');

const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_PRO_MONTHLY',
  'STRIPE_PRICE_PRO_ANNUAL',
  'STRIPE_PRICE_PREMIUM_MONTHLY',
  'STRIPE_PRICE_PREMIUM_ANNUAL',
  'OPENAI_API_KEY',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_APP_NAME',
];

if (!fs.existsSync(envPath)) {
  console.error('.env.local is missing');
  process.exit(1);
}

const env = Object.fromEntries(
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx), line.slice(idx + 1)];
    })
);

const missing = required.filter((key) =>
  !env[key] ||
  env[key].includes('your-') ||
  env[key].includes('price_...') ||
  env[key].includes('sk_test_...') ||
  env[key].includes('pk_test_...') ||
  env[key].includes('sk-ant-...') ||
  env[key].includes('sk-proj-...') ||
  env[key].includes('re_...')
);

if (!missing.length) {
  console.log('Environment looks complete.');
  process.exit(0);
}

console.log('Missing or placeholder environment values:');
for (const key of missing) {
  console.log(`- ${key}`);
}

process.exit(1);
