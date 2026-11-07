// Plan Task 1: checks how Kit's v4 API handles a waitlist signup, with a real
// test address. Prints every request and response.
//
// Usage (from landing/):
//   node --env-file=.env.local scripts/kit-check.mjs <test-email> [tag-id]
//
// Then check the inbox for the confirmation email, click it, and run:
//   node --env-file=.env.local scripts/kit-check.mjs <test-email> --status

const BASE = 'https://api.kit.com/v4';
const { KIT_API_KEY, KIT_FORM_ID } = process.env;
const [email, extra] = process.argv.slice(2);

if (!KIT_API_KEY || !KIT_FORM_ID || !email) {
    console.error('Needs KIT_API_KEY and KIT_FORM_ID in .env.local, and a test email argument.');
    process.exit(1);
}

async function call(method, path, body) {
    const res = await fetch(BASE + path, {
        method,
        headers: { 'X-Kit-Api-Key': KIT_API_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = text; }
    console.log(`\n${method} ${path}${body ? ' ' + JSON.stringify(body) : ''}\n→ ${res.status}`);
    console.log(JSON.stringify(json, null, 2));
    return { status: res.status, json };
}

async function lookup() {
    const { json } = await call('GET', `/subscribers?email_address=${encodeURIComponent(email)}&status=all`);
    const sub = json?.subscribers?.[0];
    console.log(`\n== state: ${sub?.state ?? '(not found)'}  fields: ${JSON.stringify(sub?.fields ?? {})}`);
    return sub;
}

if (extra === '--status') {
    await lookup();
    process.exit(0);
}

console.log('== 1. Create subscriber as inactive, with a UTM field');
await call('POST', '/subscribers', { email_address: email, state: 'inactive', fields: { utm_source: 'kit-check' } });

console.log('\n== 2. Add to the waitlist form (should trigger the confirmation email)');
await call('POST', `/forms/${KIT_FORM_ID}/subscribers`, {
    email_address: email,
    referrer: 'https://example.com/?utm_source=kit-check',
});

console.log('\n== 3. State after adding to the form');
await lookup();

console.log('\n== 4. Upsert again with a role field: does it update fields on an existing subscriber?');
await call('POST', '/subscribers', { email_address: email, fields: { role: 'phd' } });
await lookup();

if (extra) {
    console.log(`\n== 5. Tag by email with tag ${extra}`);
    await call('POST', `/tags/${extra}/subscribers`, { email_address: email });
}

console.log('\nNow check the inbox for the confirmation email, click it, then run this again with --status.');
