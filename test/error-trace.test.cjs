// Checks that a failed request shows the Fish Audio trace ID and error code in the
// error description. Run with `npm test` (builds first). n8n's request helper throws a
// NodeApiError whose cause is the HTTP error (n8n-workflow 2.34 and later; older versions
// drop the cause). The n8n-workflow installed here is older, so the tests set the cause
// the way n8n 2.34+ does.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { NodeApiError } = require('n8n-workflow');
const { Fishaudio } = require('../dist/nodes/Fishaudio/Fishaudio.node.js');

const node = { name: 'Fish Audio', type: 'n8n-nodes-fishaudio.fishaudio', typeVersion: 1.2 };

function apiError(status, headers) {
	const httpError = Object.assign(new Error(`Request failed with status code ${status}`), {
		name: 'AxiosError',
		isAxiosError: true,
		response: { status, headers, data: { status, message: 'refused' } },
	});
	const error = new NodeApiError(node, httpError);
	error.cause = httpError;
	return error;
}

async function runFailing(error, continueOnFail = false) {
	const context = {
		getInputData: () => [{ json: {} }],
		getNodeParameter: (name, _i, fallback) =>
			({ resource: 'account', operation: 'getCredits' })[name] ?? fallback,
		getNode: () => node,
		continueOnFail: () => continueOnFail,
		helpers: {
			httpRequestWithAuthentication: async () => {
				throw error;
			},
		},
	};
	try {
		return await new Fishaudio().execute.call(context);
	} catch (thrown) {
		return thrown;
	}
}

test('a refused request shows the trace ID and the error code', async () => {
	const thrown = await runFailing(
		apiError(401, { 'x-fish-trace-id': 'abc123', 'x-fish-error-code': 'invalid_api_key' }),
	);
	assert.ok(thrown instanceof NodeApiError);
	assert.match(thrown.description, /\(Trace ID: abc123 · Error code: invalid_api_key\)$/);
});

test('only the trace ID when there is no error code', async () => {
	const thrown = await runFailing(apiError(400, { 'x-fish-trace-id': 'abc123' }));
	assert.match(thrown.description, /\(Trace ID: abc123\)$/);
	assert.doesNotMatch(thrown.description, /Error code/);
});

test('nothing is added when the response has neither header', async () => {
	const error = apiError(401, { 'content-type': 'application/json' });
	const before = error.description;
	const thrown = await runFailing(error);
	assert.equal(thrown.description, before);
});

test('an error without a response is left alone', async () => {
	const error = new NodeApiError(
		node,
		Object.assign(new Error('socket hang up'), { code: 'ECONNRESET' }),
	);
	const before = error.description;
	const thrown = await runFailing(error);
	assert.equal(thrown.description, before);
});

test('with Continue On Fail, the output item is unchanged', async () => {
	const error = apiError(401, { 'x-fish-trace-id': 'abc123' });
	const [[item]] = await runFailing(error, true);
	assert.deepEqual(item.json, { error: error.message });
});
