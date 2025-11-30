import type { INodeProperties } from 'n8n-workflow';

const displayOptions = {
	show: {
		resource: ['speech'],
		operation: ['generate'],
	},
};

export const generateDescription: INodeProperties[] = [
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		required: true,
		default: '',
		displayOptions,
		description:
			'The text to convert to speech. Supports emotion tags like (happy), (sad), (angry), (whispering), (laughing), (sighing), etc.',
	},
	{
		displayName: 'Voice',
		name: 'voiceId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		displayOptions,
		description: 'The voice model to use for speech synthesis. Leave empty to use the default voice.',
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'voiceSearch',
					searchable: true,
				},
			},
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: 'e.g., 802e3bc2b27e49c2995d23ef70e6ac89',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '^[a-f0-9]{32}$',
							errorMessage: 'Voice ID should be a 32-character hexadecimal string',
						},
					},
				],
			},
		],
	},
	{
		displayName: 'Model',
		name: 'model',
		type: 'options',
		displayOptions,
		options: [
			{
				name: 'S1 (Recommended)',
				value: 's1',
				description: 'Most expressive model with full emotional control',
			},
			{
				name: 'Speech 1.6 (Legacy)',
				value: 'speech-1.6',
				description: 'Legacy model with basic emotion control',
			},
			{
				name: 'Speech 1.5 (Legacy)',
				value: 'speech-1.5',
				description: 'Legacy model, stable with least emotion variance',
			},
		],
		default: 's1',
		description: 'TTS model to use for speech generation',
	},
	{
		displayName: 'Output Format',
		name: 'format',
		type: 'options',
		displayOptions,
		options: [
			{ name: 'MP3', value: 'mp3' },
			{ name: 'WAV', value: 'wav' },
			{ name: 'PCM', value: 'pcm' },
			{ name: 'Opus', value: 'opus' },
		],
		default: 'mp3',
		description: 'Audio output format',
	},
	{
		displayName: 'Put Output in Field',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		displayOptions,
		description: 'The name of the output binary field to store the audio',
	},
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions,
		options: [
			{
				displayName: 'Latency Mode',
				name: 'latency',
				type: 'options',
				options: [
					{ name: 'Balanced (Faster)', value: 'balanced' },
					{ name: 'Normal (Higher Quality)', value: 'normal' },
				],
				default: 'balanced',
				description: 'Trade-off between speed and quality',
			},
			{
				displayName: 'Normalize Text',
				name: 'normalize',
				type: 'boolean',
				default: true,
				description: 'Whether to normalize and clean the input text',
			},
			{
				displayName: 'Sample Rate',
				name: 'sampleRate',
				type: 'options',
				options: [
					{ name: '8 kHz', value: 8000 },
					{ name: '16 kHz', value: 16000 },
					{ name: '24 kHz', value: 24000 },
					{ name: '32 kHz', value: 32000 },
					{ name: '44.1 kHz', value: 44100 },
				],
				default: 44100,
				description: 'Audio sample rate',
			},
			{
				displayName: 'Speed',
				name: 'speed',
				type: 'number',
				typeOptions: {
					minValue: 0.5,
					maxValue: 2,
					numberPrecision: 1,
				},
				default: 1,
				description: 'Speech speed multiplier (0.5 to 2.0)',
			},
			{
				displayName: 'Temperature',
				name: 'temperature',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberPrecision: 2,
				},
				default: 0.7,
				description: 'Controls randomness in generation. Higher values produce more varied output.',
			},
			{
				displayName: 'Top P',
				name: 'topP',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberPrecision: 2,
				},
				default: 0.7,
				description: 'Nucleus sampling parameter for token selection',
			},
		],
	},
];
