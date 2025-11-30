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
		required: true,
		displayOptions,
		description: 'The voice model to use for speech synthesis',
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
				displayName: 'Normalize Text',
				name: 'normalize',
				type: 'boolean',
				default: true,
				description: 'Whether to normalize and clean the input text',
			},
		],
	},
];
