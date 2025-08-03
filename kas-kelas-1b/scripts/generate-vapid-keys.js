const webpush = require('web-push');
const crypto = require('crypto');

console.log('🔑 Generating VAPID Keys for Push Notifications...\n');

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

console.log('📱 VAPID Public Key (for frontend):');
console.log(`REACT_APP_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}\n`);

console.log('🔒 VAPID Private Key (for backend):');
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}\n`);

console.log('📧 VAPID Subject (your email):');
console.log('VAPID_SUBJECT=mailto:admin@kaskelasb.com\n');

// Generate CRON Secret
const cronSecret = crypto.randomBytes(32).toString('hex');
console.log('🔐 CRON Secret (for Vercel):');
console.log(`CRON_SECRET=${cronSecret}\n`);

// Generate random tokens for examples
const randomToken = crypto.randomBytes(16).toString('hex');
const randomPin = Math.floor(100000 + Math.random() * 900000);

console.log('📝 Example Values:');
console.log(`Example Access Token: ${randomToken}`);
console.log(`Example PIN Code: ${randomPin}\n`);

console.log('✅ Keys generated successfully!');
console.log('\n⚠️  IMPORTANT:');
console.log('1. Copy these keys to your .env file');
console.log('2. Add them to Vercel Environment Variables');
console.log('3. Keep VAPID_PRIVATE_KEY and CRON_SECRET secure!');
console.log('4. Never commit these keys to Git');