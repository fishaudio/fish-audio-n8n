import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

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

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.fish.audio',
			url: '/wallet/self/api-credit',
		},
	};
}
