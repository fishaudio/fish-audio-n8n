import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IDataObject,
	IHttpRequestOptions,
} from 'n8n-workflow';

export const API_BASE_URL = 'https://api.fish.audio';

export const MIME_TYPES: Record<string, string> = {
	mp3: 'audio/mpeg',
	wav: 'audio/wav',
	opus: 'audio/opus',
	pcm: 'audio/pcm',
};

export async function fishAudioApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
	qs?: IDataObject,
	options?: Partial<IHttpRequestOptions>,
): Promise<unknown> {
	const requestOptions: IHttpRequestOptions = {
		method,
		baseURL: API_BASE_URL,
		url: endpoint,
		json: true,
		...options,
	};

	if (body && Object.keys(body).length > 0) {
		requestOptions.body = body;
	}

	if (qs && Object.keys(qs).length > 0) {
		requestOptions.qs = qs;
	}

	return await this.helpers.httpRequestWithAuthentication.call(
		this,
		'fishaudioApi',
		requestOptions,
	);
}