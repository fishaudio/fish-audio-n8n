import type {
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IDataObject,
	IHttpRequestOptions,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

// Read from the package.json built next to this file, so the version (and a
// renamed or scoped package) never needs updating here.
import packageJson from '../package.json';

/** `fish-audio-<language>/<version>`, the format every Fish Audio SDK sends (one RFC 9110 product). */
export const PRODUCT = `fish-audio-n8n/${packageJson.version}`;

const SAFE_PREFIX = /^[A-Za-z0-9._+-]+/;

/**
 * Makes a value safe inside an RFC 9110 comment: keeps its leading run of
 * letters, digits and `._+-` (at most 32 characters) and drops the rest, so
 * `(`, `)`, `\`, spaces and control characters can never reach the header.
 * Returns `unknown` when nothing usable is left.
 */
export function commentValue(value: unknown): string {
	if (typeof value !== 'string') {
		return 'unknown';
	}
	const match = SAFE_PREFIX.exec(value.trim());
	return match ? match[0].slice(0, 32) : 'unknown';
}

/**
 * The Node.js major version from `navigator.userAgent` (`Node.js/24`). Community
 * nodes may not read `process`, and `navigator` gives only the major version.
 */
export function nodeMajorVersion(userAgent: unknown): string {
	if (typeof userAgent !== 'string' || !userAgent.startsWith('Node.js/')) {
		return 'unknown';
	}
	return commentValue(userAgent.slice('Node.js/'.length));
}

/**
 * The OS family from Node's `navigator.platform` (`MacIntel`, `Win32`,
 * `Linux x86_64`, `FreeBSD amd64`, ...), as one short lowercase word. The
 * architecture is dropped.
 */
export function osFamily(platform: unknown): string {
	if (typeof platform !== 'string') {
		return 'unknown';
	}
	if (platform.startsWith('Mac')) {
		return 'darwin';
	}
	if (platform.startsWith('Win')) {
		return 'windows';
	}
	return commentValue(platform.toLowerCase());
}

/**
 * `fish-audio-n8n/<version> (node <major>; <os>)`. Only the runtime, its version
 * and the OS family are included: nothing that identifies a person or machine.
 */
export function buildUserAgent(nav: { userAgent?: unknown; platform?: unknown } | undefined): string {
	return `${PRODUCT} (node ${nodeMajorVersion(nav?.userAgent)}; ${osFamily(nav?.platform)})`;
}

/** Computed once, when n8n loads the credential, e.g. `fish-audio-n8n/0.5.0 (node 24; linux)`. */
export const USER_AGENT = buildUserAgent(typeof navigator === 'undefined' ? undefined : navigator);

/**
 * Returns the headers with one `User-Agent`: ours (product and runtime comment)
 * first, then the value the request already had (matched in any casing), as
 * every Fish Audio SDK does.
 */
export function withUserAgent(headers: IDataObject | undefined): IDataObject {
	const result: IDataObject = {};
	let callerValue = '';
	for (const [name, value] of Object.entries(headers ?? {})) {
		if (name.toLowerCase() === 'user-agent') {
			callerValue = value == null ? '' : String(value).trim();
		} else {
			result[name] = value;
		}
	}
	// A value that already starts with ours (a request authenticated twice) is not doubled.
	if (callerValue === USER_AGENT || callerValue.startsWith(`${USER_AGENT} `)) {
		callerValue = callerValue.slice(USER_AGENT.length).trim();
	}
	result['User-Agent'] = callerValue === '' ? USER_AGENT : `${USER_AGENT} ${callerValue}`;
	return result;
}

export class FishaudioApi implements ICredentialType {
	name = 'fishaudioApi';

	displayName = 'Fish Audio API';

	icon: Icon = 'file:../nodes/Fishaudio/fishaudio.svg';

	documentationUrl = 'https://docs.fish.audio/n8n';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
		},
	];

	// A function rather than a generic block so that a User-Agent already on the
	// request (one set in the HTTP Request node, for example) is kept after ours
	// instead of being overwritten. It runs for every request made with this
	// credential, including the credential test and operations added later.
	async authenticate(
		credentials: ICredentialDataDecryptedObject,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		return {
			...requestOptions,
			headers: {
				...withUserAgent(requestOptions.headers),
				Authorization: `Bearer ${credentials.apiKey as string}`,
			},
		};
	}

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.fish.audio',
			url: '/wallet/self/api-credit',
		},
	};
}
