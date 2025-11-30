import type { INodeProperties } from 'n8n-workflow';

const displayOptions = {
	show: {
		resource: ['voiceModel'],
		operation: ['get'],
	},
};

export const getDescription: INodeProperties[] = [
	{
		displayName: 'Voice Model',
		name: 'modelId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		displayOptions,
		description: 'The voice model to retrieve',
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
							errorMessage: 'Model ID should be a 32-character hexadecimal string',
						},
					},
				],
			},
		],
	},
];