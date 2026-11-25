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
export const USER_AGENT = `fish-audio-n8n/${packageJson.version}`;

/**
 * Returns the headers with one `User-Agent`: ours first, then the value the
 * request already had (matched in any casing), as every Fish Audio SDK does.
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
