import type { INodeProperties } from 'n8n-workflow';
import { listDescription } from './list';
import { getDescription } from './get';
import { createDescription } from './create';
import { deleteDescription } from './delete';

export const voiceModelDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['voiceModel'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a voice model',
				description: 'Create a new voice model from audio samples',
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a voice model',
				description: 'Delete an existing voice model',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a voice model',
				description: 'Retrieve details of a voice model',
			},
			{
				name: 'List',
				value: 'list',
				action: 'List voice models',
				description: 'List available voice models',
			},
		],
		default: 'list',
	},
	...listDescription,
	...getDescription,
	...createDescription,
	...deleteDescription,
];