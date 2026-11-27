// Checks what Speech > Generate sends for the Language option. Run with `npm test`
// (builds first). Drives the built node with a minimal stand-in for n8n's context.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { Fishaudio } = require('../dist/nodes/Fishaudio/Fishaudio.node.js');

async function generateBody(additionalOptions) {
	const params = {
		resource: 'speech',
		operation: 'generate',
		text: 'Hello',
		format: 'mp3',
		binaryPropertyName: 'data',
		additionalOptions,
	};
	const requests = [];
	const context = {
		getInputData: () => [{ json: {} }],
		getNodeParameter: (name, _i, fallback) => (name in params ? params[name] : fallback),
		getNode: () => ({ name: 'Fish Audio', typeVersion: 1.2 }),
		continueOnFail: () => false,
		helpers: {
			httpRequestWithAuthentication: async (_credential, options) => {
				requests.push(options);
				return new ArrayBuffer(1);
			},
			prepareBinaryData: async () => ({ data: '' }),
		},
	};
	await new Fishaudio().execute.call(context);
	assert.equal(requests.length, 1);
	return requests[0].body;
}

test('without the option, no language is sent (saved workflows are unchanged)', async () => {
	assert.equal('language' in (await generateBody({})), false);
});

test('an empty value sends nothing', async () => {
	assert.equal('language' in (await generateBody({ language: '' })), false);
});

test('a tag is sent as given', async () => {
	assert.equal((await generateBody({ language: 'es-MX' })).language, 'es-MX');
	assert.equal((await generateBody({ language: 'ZH_cn' })).language, 'ZH_cn');
});
