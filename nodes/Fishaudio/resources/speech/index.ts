import type { INodeProperties } from 'n8n-workflow';
import { generateDescription } from './generate';

export const speechDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['speech'],
			},
		},
		options: [
			{
				name: 'Generate',
				value: 'generate',
				action: 'Generate speech from text',
				description: 'Convert text to speech using Fish Audio TTS',
			},
		],
		default: 'generate',
	},
	...generateDescription,
];
