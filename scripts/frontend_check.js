const http = require('http');
const https = require('https');
const { URL } = require('url');

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === 'https:' ? https : http;
    const req = lib.get(u, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
  });
}

(async () => {
  try {
    const urls = [
      'http://localhost:5176/',
      'http://localhost:5176/activate/testtoken',
      'http://localhost:4000/api/landing/features',
      'http://localhost:4000/api/landing/stats'
    ];

    for (const u of urls) {
      process.stdout.write('\n--- ' + u + ' ---\n');
      try {
        const r = await fetchText(u);
        console.log('Status:', r.status);
        const snippet = r.body ? r.body.substring(0, 600) : '';
        console.log(snippet.replace(/\n/g, '\\n'));
      } catch (e) {
        console.error('ERROR fetching', u, e.message);
      }
    }
  } catch (e) {
    console.error('Fatal:', e);
    process.exit(1);
  }
})();
