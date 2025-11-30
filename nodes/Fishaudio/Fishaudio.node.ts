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
import { voiceModelDescription } from './resources/voiceModel';
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
						description: 'Text-to-speech and speech-to-text conversion',
					},
					{
						name: 'Voice Model',
						value: 'voiceModel',
						description: 'Manage voice models for cloning',
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
			...voiceModelDescription,
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

		if (resource === 'speech' && operation === 'transcribe') {
			return executeSpeechTranscribe.call(this, items);
		}

		if (resource === 'account' && operation === 'getCredits') {
			return executeAccountGetCredits.call(this);
		}

		if (resource === 'voiceModel') {
			switch (operation) {
				case 'list':
					return executeVoiceModelList.call(this);
				case 'get':
					return executeVoiceModelGet.call(this);
				case 'create':
					return executeVoiceModelCreate.call(this, items);
				case 'delete':
					return executeVoiceModelDelete.call(this);
			}
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
		const voiceIdParam = this.getNodeParameter('voiceId', i, { value: '' }) as string | { value: string };
		const voiceId = typeof voiceIdParam === 'string' ? voiceIdParam : voiceIdParam.value;
		const model = this.getNodeParameter('model', i, 's1') as string;
		const format = this.getNodeParameter('format', i, 'mp3') as string;
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i, 'data') as string;
		const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as {
			latency?: string;
			speed?: number;
			sampleRate?: number;
			normalize?: boolean;
			temperature?: number;
			topP?: number;
		};

		const body: IDataObject = {
			text,
			format,
		};

		if (voiceId) {
			body.reference_id = voiceId;
		}

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
		if (additionalOptions.temperature !== undefined) {
			body.temperature = additionalOptions.temperature;
		}
		if (additionalOptions.topP !== undefined) {
			body.top_p = additionalOptions.topP;
		}

		const response = await fishAudioApiRequest.call(this, 'POST', '/v1/tts', body, undefined, {
			encoding: 'arraybuffer',
			json: false,
			headers: { model },
		});

		const binaryData = await this.helpers.prepareBinaryData(
			Buffer.from(response as ArrayBuffer),
			`output.${format}`,
			MIME_TYPES[format] || 'audio/mpeg',
		);

		returnData.push({
			json: { model, format, voiceId, textLength: text.length },
			binary: { [binaryPropertyName]: binaryData },
		});
	}

	return [returnData];
}

async function executeSpeechTranscribe(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[][]> {
	const returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i, 'data') as string;
		const options = this.getNodeParameter('options', i, {}) as {
			language?: string;
			includeTimestamps?: boolean;
		};

		const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
		const audioBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

		// Build multipart form data
		const formData = new FormData();
		formData.append(
			'audio',
			new Blob([audioBuffer], { type: binaryData.mimeType || 'audio/mpeg' }),
			binaryData.fileName || 'audio.mp3',
		);

		if (options.language) {
			formData.append('language', options.language);
		}
		if (options.includeTimestamps === false) {
			formData.append('ignore_timestamps', 'true');
		}

		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'fishaudioApi',
			{
				method: 'POST',
				baseURL: API_BASE_URL,
				url: '/v1/asr',
				body: formData,
			},
		);

		returnData.push({
			json: response as IDataObject,
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

// Voice Model Operations

async function executeVoiceModelList(
	this: IExecuteFunctions,
): Promise<INodeExecutionData[][]> {
	const returnAll = this.getNodeParameter('returnAll', 0) as boolean;
	const limit = this.getNodeParameter('limit', 0, 50) as number;
	const filters = this.getNodeParameter('filters', 0, {}) as {
		selfOnly?: boolean;
		title?: string;
		tags?: string;
		language?: string;
		sortBy?: string;
	};

	const qs: IDataObject = {
		page_size: returnAll ? 100 : limit,
		page_number: 1,
	};

	if (filters.selfOnly) {
		qs.self = true;
	}
	if (filters.title) {
		qs.title = filters.title;
	}
	if (filters.tags) {
		qs.tag = filters.tags.split(',').map((t) => t.trim());
	}
	if (filters.language) {
		qs.language = filters.language;
	}
	if (filters.sortBy) {
		qs.sort_by = filters.sortBy;
	}

	const returnData: INodeExecutionData[] = [];

	if (returnAll) {
		let hasMore = true;
		while (hasMore) {
			const response = (await fishAudioApiRequest.call(this, 'GET', '/model', undefined, qs)) as {
				items: IDataObject[];
				total: number;
			};
			for (const item of response.items) {
				returnData.push({ json: item });
			}
			if (returnData.length >= response.total) {
				hasMore = false;
			} else {
				qs.page_number = (qs.page_number as number) + 1;
			}
		}
	} else {
		const response = (await fishAudioApiRequest.call(this, 'GET', '/model', undefined, qs)) as {
			items: IDataObject[];
		};
		for (const item of response.items) {
			returnData.push({ json: item });
		}
	}

	return [returnData];
}

async function executeVoiceModelGet(
	this: IExecuteFunctions,
): Promise<INodeExecutionData[][]> {
	const modelIdParam = this.getNodeParameter('modelId', 0) as string | { value: string };
	const modelId = typeof modelIdParam === 'string' ? modelIdParam : modelIdParam.value;

	const response = await fishAudioApiRequest.call(this, 'GET', `/model/${modelId}`);

	return [[{ json: response as IDataObject }]];
}

async function executeVoiceModelCreate(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[][]> {
	const title = this.getNodeParameter('title', 0) as string;
	const voiceAudioField = this.getNodeParameter('voiceAudioField', 0) as string;
	const options = this.getNodeParameter('options', 0, {}) as {
		description?: string;
		visibility?: string;
		tags?: string;
		coverImageField?: string;
	};

	const formData = new FormData();
	formData.append('title', title);

	// Add voice audio file(s)
	const binaryData = this.helpers.assertBinaryData(0, voiceAudioField);
	const audioBuffer = await this.helpers.getBinaryDataBuffer(0, voiceAudioField);
	formData.append(
		'voices',
		new Blob([audioBuffer], { type: binaryData.mimeType || 'audio/mpeg' }),
		binaryData.fileName || 'voice.mp3',
	);

	if (options.description) {
		formData.append('description', options.description);
	}
	if (options.visibility) {
		formData.append('visibility', options.visibility);
	}
	if (options.tags) {
		const tags = options.tags.split(',').map((t) => t.trim());
		for (const tag of tags) {
			formData.append('tags', tag);
		}
	}
	if (options.coverImageField && items[0].binary?.[options.coverImageField]) {
		const coverBuffer = await this.helpers.getBinaryDataBuffer(0, options.coverImageField);
		const coverData = this.helpers.assertBinaryData(0, options.coverImageField);
		formData.append(
			'cover_image',
			new Blob([coverBuffer], { type: coverData.mimeType || 'image/png' }),
			coverData.fileName || 'cover.png',
		);
	}

	const response = await this.helpers.httpRequestWithAuthentication.call(
		this,
		'fishaudioApi',
		{
			method: 'POST',
			baseURL: API_BASE_URL,
			url: '/model',
			body: formData,
		},
	);

	return [[{ json: response as IDataObject }]];
}

async function executeVoiceModelDelete(
	this: IExecuteFunctions,
): Promise<INodeExecutionData[][]> {
	const modelIdParam = this.getNodeParameter('modelId', 0) as string | { value: string };
	const modelId = typeof modelIdParam === 'string' ? modelIdParam : modelIdParam.value;

	await fishAudioApiRequest.call(this, 'DELETE', `/model/${modelId}`);

	return [[{ json: { success: true, deletedModelId: modelId } }]];
}