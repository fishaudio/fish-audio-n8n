import type { INodeProperties } from 'n8n-workflow';

const displayOptions = {
	show: {
		resource: ['speech'],
		operation: ['transcribe'],
	},
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