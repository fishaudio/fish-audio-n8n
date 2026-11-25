// Checks the User-Agent the built credential sends. Run with `npm test`
// (builds first). Uses only node:test, so the package gains no dependencies.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const m = require('../dist/credentials/FishaudioApi.credentials.js');
const packageJson = require('../package.json');

const TCHAR = "[!#$%&'*+\\-.^_`|~0-9A-Za-z]";
// RFC 9110: product, then a comment with nothing that ctext excludes.
const GRAMMAR = new RegExp(`^${TCHAR}+/${TCHAR}+ \\([^()\\\\\\x00-\\x1f\\x7f]*\\)$`);
const P = `fish-audio-n8n/${packageJson.version}`;

test('the product is fish-audio-n8n/<package.json version>', () => {
	assert.equal(m.PRODUCT, P);
});

test('on this Node it names node, the major version and the OS family', () => {
	const os = { win32: 'windows' }[process.platform] ?? process.platform;
	assert.equal(m.USER_AGENT, `${P} (node ${process.versions.node.split('.')[0]}; ${os})`);
	assert.match(m.USER_AGENT, GRAMMAR);
});

test('maps navigator values to the shape (node <major>; <os>)', () => {
	const cases = [
		[{ userAgent: 'Node.js/24', platform: 'MacIntel' }, `${P} (node 24; darwin)`],
		[{ userAgent: 'Node.js/22', platform: 'Linux x86_64' }, `${P} (node 22; linux)`],
		[{ userAgent: 'Node.js/24', platform: 'Linux aarch64' }, `${P} (node 24; linux)`],
		[{ userAgent: 'Node.js/24', platform: 'Win32' }, `${P} (node 24; windows)`],
		[{ userAgent: 'Node.js/24', platform: 'FreeBSD amd64' }, `${P} (node 24; freebsd)`],
		[undefined, `${P} (node unknown; unknown)`],
		[{ userAgent: 'Mozilla/5.0 (X11)', platform: 42 }, `${P} (node unknown; unknown)`],
	];
	for (const [nav, want] of cases) {
		assert.equal(m.buildUserAgent(nav), want, JSON.stringify(nav));
	}
});

test('drops anything that could break the comment', () => {
	const hostile = [
		{ userAgent: 'Node.js/24 (evil)', platform: 'Linux) (x' },
		{ userAgent: 'Node.js/24\r\nX-Injected: 1', platform: 'Linux\\x' },
		{ userAgent: 'Node.js/24\u0000', platform: 'Linux\u0000' },
		{ userAgent: 'Node.js/', platform: '(x)' },
	];
	for (const nav of hostile) {
		assert.match(m.buildUserAgent(nav), GRAMMAR, JSON.stringify(nav));
	}
	assert.equal(m.commentValue('(x)'), 'unknown');
	assert.equal(m.commentValue('1'.repeat(100)), '1'.repeat(32));
});

test("a request's own User-Agent comes after ours, in any casing", () => {
	assert.deepEqual(m.withUserAgent({ 'user-agent': 'my-flow/1.0', Accept: 'x' }), {
		Accept: 'x',
		'User-Agent': `${m.USER_AGENT} my-flow/1.0`,
	});
	assert.deepEqual(m.withUserAgent({ 'User-Agent': m.USER_AGENT }), { 'User-Agent': m.USER_AGENT });
	assert.deepEqual(m.withUserAgent(undefined), { 'User-Agent': m.USER_AGENT });
});
