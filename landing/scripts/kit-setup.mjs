// One-time Kit setup: creates the waitlist's custom fields and role tags if
// they don't exist yet, and prints the KIT_ROLE_TAGS value to use.
//
// Usage (from landing/): node --env-file=.env.local scripts/kit-setup.mjs

const BASE = 'https://api.kit.com/v4';
const { KIT_API_KEY } = process.env;
if (!KIT_API_KEY) {
    console.error('Needs KIT_API_KEY in .env.local.');
    process.exit(1);
}

const FIELDS = ['role', 'use_case', 'utm_source', 'utm_medium', 'utm_campaign', 'signup_date'];
const ROLE_TAGS = {
    masters: "Grad student (master's)",
    phd: 'Grad student (PhD)',
    faculty: 'Faculty',
    staff_researcher: 'Staff or researcher',
    other: 'Other',
};

async function call(method, path, body) {
    const res = await fetch(BASE + path, {
        method,
        headers: { 'X-Kit-Api-Key': KIT_API_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${JSON.stringify(json)}`);
    return json;
}

const { custom_fields: existingFields = [] } = await call('GET', '/custom_fields?per_page=1000');
for (const label of FIELDS) {
    const found = existingFields.find((f) => f.key === label || f.label === label);
    if (found) {
        console.log(`field ${label}: exists (key ${found.key})`);
        continue;
    }
    const { custom_field } = await call('POST', '/custom_fields', { label });
    console.log(`field ${label}: created (key ${custom_field.key})`);
}

const { tags: existingTags = [] } = await call('GET', '/tags?per_page=1000');
const tagIds = {};
for (const [role, name] of Object.entries(ROLE_TAGS)) {
    let tag = existingTags.find((t) => t.name === name);
    if (tag) console.log(`tag "${name}": exists (id ${tag.id})`);
    else {
        tag = (await call('POST', '/tags', { name })).tag;
        console.log(`tag "${name}": created (id ${tag.id})`);
    }
    tagIds[role] = tag.id;
}

console.log(`\nKIT_ROLE_TAGS=${JSON.stringify(tagIds)}`);
