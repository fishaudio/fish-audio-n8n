import type { INodeProperties } from 'n8n-workflow';

const displayOptions = {
	show: {
		resource: ['speech'],
		operation: ['transcribe'],
	},
};

// Declared once per node version so that saved workflows keep the model they ran on:
// n8n does not store a parameter whose value equals the default.
const sttModelProperty: INodeProperties = {
	displayName: 'Model',
	name: 'sttModel',
	type: 'options',
	options: [
		{
			name: 'Transcribe 1 Pro (Recommended)',
			value: 'transcribe-1-pro',
			description: 'Recommended speech-to-text model',
		},
		{
			name: 'Transcribe 1 (Retiring December 31, 2026)',
			value: 'transcribe-1',
			description: 'After December 31, 2026, requests are served by Transcribe 1 Pro',
		},
	],
	default: 'transcribe-1-pro',
	description: 'Speech-to-text model to use',
};

export const transcribeDescription: INodeProperties[] = [
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions,
		description: 'The name of the input binary field containing the audio to transcribe',
	},
	{
		...sttModelProperty,
		default: 'transcribe-1',
		displayOptions: { show: { ...displayOptions.show, '@version': [1, 1.1] } },
	},
	{
		...sttModelProperty,
		default: 'transcribe-1-pro',
		displayOptions: { show: { ...displayOptions.show, '@version': [{ _cnd: { gte: 1.2 } }] } },
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions,
		options: [
			{
				displayName: 'Language',
				name: 'language',
				type: 'options',
				options: [
					{ name: 'Auto-Detect', value: '' },
					{ name: 'Chinese', value: 'zh' },
					{ name: 'English', value: 'en' },
					{ name: 'French', value: 'fr' },
					{ name: 'German', value: 'de' },
					{ name: 'Japanese', value: 'ja' },
					{ name: 'Korean', value: 'ko' },
					{ name: 'Portuguese', value: 'pt' },
					{ name: 'Spanish', value: 'es' },
				],
				default: '',
				description: 'Language of the audio. If not specified, it will be auto-detected.',
			},
			{
				displayName: 'Include Timestamps',
				name: 'includeTimestamps',
				type: 'boolean',
				default: true,
				description: 'Whether to include timestamp information for each segment',
			},
		],
	},
];