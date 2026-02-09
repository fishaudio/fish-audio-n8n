import type { INodeProperties } from 'n8n-workflow';
import { getCreditsDescription } from './getCredits';

export const accountDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['account'],
			},
		},
		options: [
			{
				name: 'Get Credits',
				value: 'getCredits',
				action: 'Get API credit balance',
				description: 'Get your current Fish Audio API credit balance',
			},
		],
		default: 'getCredits',
	},
	...getCreditsDescription,
];
