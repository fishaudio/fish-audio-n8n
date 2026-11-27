import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IDataObject,
	IHttpRequestOptions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

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

	try {
		return await this.helpers.httpRequestWithAuthentication.call(
			this,
			'fishaudioApi',
			requestOptions,
		);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Adds the Fish Audio trace ID and error code to an API error's description, when the
 * response carries them, so users can quote them to support. n8n keeps the HTTP error
 * as the error's cause. Responses without these headers leave the error unchanged.
 */
export function addTraceDetails(error: unknown): void {
	if (!(error instanceof NodeApiError)) {
		return;
	}
	const headers = (error.cause as { response?: { headers?: Record<string, unknown> } } | undefined)
		?.response?.headers;
	const header = (name: string) => {
		const value = headers?.[name];
		return typeof value === 'string' && value !== '' ? value : undefined;
	};
	const details = [
		['Trace ID', header('x-fish-trace-id')],
		['Error code', header('x-fish-error-code')],
	]
		.filter(([, value]) => value !== undefined)
		.map(([label, value]) => `${label}: ${value}`)
		.join(' · ');
	if (details === '' || error.description?.includes(details)) {
		return;
	}
	error.description = error.description ? `${error.description} (${details})` : details;
}
