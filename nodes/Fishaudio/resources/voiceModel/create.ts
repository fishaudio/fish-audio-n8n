import type { INodeProperties } from 'n8n-workflow';

const displayOptions = {
	show: {
		resource: ['voiceModel'],
		operation: ['create'],
	},
};

export const createDescription: INodeProperties[] = [
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		default: '',
		displayOptions,
		description: 'Name for the voice model',
	},
	{
		displayName: 'Voice Audio Field',
		name: 'voiceAudioField',
		type: 'string',
		required: true,
		default: 'data',
		displayOptions,
		description: 'The name of the binary field containing the voice audio sample(s)',
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
				displayName: 'Cover Image Field',
				name: 'coverImageField',
				type: 'string',
				default: '',
				description: 'The name of the binary field containing a cover image (optional)',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
				description: 'Description of the voice model',
			},
			{
				displayName: 'Enhance Audio Quality',
				name: 'enhanceAudioQuality',
				type: 'boolean',
				default: true,
				description: 'Whether to clean up the voice samples before creating the voice model',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Tags for categorization (comma-separated)',
			},
			{
				displayName: 'Visibility',
				name: 'visibility',
				type: 'options',
				options: [
					{ name: 'Private', value: 'private' },
					{ name: 'Public', value: 'public' },
					{ name: 'Unlisted', value: 'unlist' },
				],
				default: 'private',
				description:
					'Who can see and use this voice model. Public requests are created as private; publish a voice from the Fish Audio website.',
			},
		],
	},
];
