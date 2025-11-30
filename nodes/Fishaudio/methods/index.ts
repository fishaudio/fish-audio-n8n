import type { INodeListSearchResult, ILoadOptionsFunctions } from 'n8n-workflow';
import { voiceSearch } from './listSearch';

export const listSearch = {
	voiceSearch: async function (
		this: ILoadOptionsFunctions,
		filter?: string,
	): Promise<INodeListSearchResult> {
		return voiceSearch.call(this, filter);
	},
};