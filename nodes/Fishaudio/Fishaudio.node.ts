import {
	NodeConnectionTypes,
	NodeOperationError,
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';

import { speechDescription } from './resources/speech';
import { accountDescription } from './resources/account';
import { listSearch } from './methods';
import { API_BASE_URL, MIME_TYPES, fishAudioApiRequest } from './GenericFunctions';

export class Fishaudio implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Fish Audio',
		name: 'fishaudio',
		icon: { light: 'file:fishaudio.svg', dark: 'file:fishaudio.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Use Fish Audio for text-to-speech and voice generation',
		defaults: {
			name: 'Fish Audio',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'fishaudioApi', required: true }],
		requestDefaults: {
			baseURL: API_BASE_URL,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Speech',
						value: 'speech',
						description: 'Text-to-speech conversion',
					},
					{
						name: 'Account',
						value: 'account',
						description: 'Account information and credits',
					},
				],
				default: 'speech',
			},
			...speechDescription,
			...accountDescription,
		],
	};

	methods = { listSearch };

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		if (resource === 'speech' && operation === 'generate') {
			return executeSpeechGenerate.call(this, items);
		}

		if (resource === 'account' && operation === 'getCredits') {
			return executeAccountGetCredits.call(this);
		}

		throw new NodeOperationError(
			this.getNode(),
			`Unsupported resource/operation: ${resource}/${operation}`,
		);
	}
}

async function executeSpeechGenerate(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[][]> {
	const returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		const text = this.getNodeParameter('text', i) as string;
		const voiceIdParam = this.getNodeParameter('voiceId', i) as string | { value: string };
		const voiceId = typeof voiceIdParam === 'string' ? voiceIdParam : voiceIdParam.value;
		const format = this.getNodeParameter('format', i, 'mp3') as string;
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i, 'data') as string;
		const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as {
			latency?: string;
			speed?: number;
			sampleRate?: number;
			normalize?: boolean;
		};

		const body: IDataObject = {
			text,
			reference_id: voiceId,
			format,
		};

		if (additionalOptions.latency) {
			body.latency = additionalOptions.latency;
		}
		if (additionalOptions.speed !== undefined) {
			body.prosody = { speed: additionalOptions.speed };
		}
		if (additionalOptions.sampleRate !== undefined) {
			body.sample_rate = additionalOptions.sampleRate;
		}
		if (additionalOptions.normalize !== undefined) {
			body.normalize = additionalOptions.normalize;
		}

		const response = await fishAudioApiRequest.call(this, 'POST', '/v1/tts', body, undefined, {
			encoding: 'arraybuffer',
			json: false,
		});

		const binaryData = await this.helpers.prepareBinaryData(
			Buffer.from(response as ArrayBuffer),
			`output.${format}`,
			MIME_TYPES[format] || 'audio/mpeg',
		);

		returnData.push({
			json: { format, voiceId, textLength: text.length },
			binary: { [binaryPropertyName]: binaryData },
		});
	}

	return [returnData];
}

async function executeAccountGetCredits(
	this: IExecuteFunctions,
): Promise<INodeExecutionData[][]> {
	const accountData = await fishAudioApiRequest.call(
		this,
		'GET',
		'/wallet/self/api-credit',
	);

	return [[{ json: accountData as IDataObject }]];
}