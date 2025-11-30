import type { ILoadOptionsFunctions, INodeListSearchResult } from 'n8n-workflow';
import { fishAudioApiRequest } from '../GenericFunctions';

interface VoiceModel {
	_id: string;
	title: string;
	task_count?: number;
	author?: { nickname?: string };
}

interface VoiceListResponse {
	items: VoiceModel[];
	total: number;
}

function formatVoiceDisplayName(voice: VoiceModel): string {
	const meta: string[] = [];

	if (voice.author?.nickname) {
		meta.push(voice.author.nickname);
	}
	if (voice.task_count) {
		meta.push(`${voice.task_count.toLocaleString()} uses`);
	}

	return meta.length ? `${voice.title} (${meta.join(' · ')})` : voice.title;
}

export async function voiceSearch(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const response = (await fishAudioApiRequest.call(this, 'GET', '/model', undefined, {
		page_size: 50,
		title: filter || undefined,
	})) as VoiceListResponse;

	const voices = response.items || [];

	return {
		results: voices.map((voice) => ({
			name: formatVoiceDisplayName(voice),
			value: voice._id,
			url: `https://fish.audio/m/${voice._id}`,
		})),
	};
}