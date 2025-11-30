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
				displayName: 'Visibility',
				name: 'visibility',
				type: 'options',
				options: [
					{ name: 'Private', value: 'private' },
					{ name: 'Public', value: 'public' },
					{ name: 'Unlisted', value: 'unlisted' },
				],
				default: 'private',
				description: 'Who can see and use this voice model',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Tags for categorization (comma-separated)',
			},
			{
				displayName: 'Cover Image Field',
				name: 'coverImageField',
				type: 'string',
				default: '',
				description: 'The name of the binary field containing a cover image (optional)',
			},
		],
	},
];
