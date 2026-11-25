import type { INodeProperties } from 'n8n-workflow';
import { name as packageName } from '../../package.json';

// This repository is published under two npm names from the same source:
// the current name, and the previous name so that existing workflows keep working.
// `scripts/set-package-name.mjs` switches `name` in package.json before each build.
export const CURRENT_PACKAGE_NAME = '@fishaudio/n8n-nodes-fishaudio';
export const PREVIOUS_PACKAGE_NAME = 'n8n-nodes-fishaudio';
export const MIGRATION_GUIDE_URL =
	'https://github.com/fishaudio/fish-audio-n8n#move-from-n8n-nodes-fishaudio';

export const isPreviousPackage = packageName === PREVIOUS_PACKAGE_NAME;

// Shown at the top of the node's settings in the previous package only. It is a notice and
// not a `deprecated` flag: n8n blocks editing deprecated nodes by default.
export const packageMovedNotice: INodeProperties[] = isPreviousPackage
	? [
			{
				displayName: `This package has moved to <b>${CURRENT_PACKAGE_NAME}</b>. This node keeps working and your workflows don't need to change. To switch a workflow to the new package, see the <a href="${MIGRATION_GUIDE_URL}" target="_blank">migration guide</a>.`,
				name: 'packageMovedNotice',
				type: 'notice',
				default: '',
			},
		]
	: [];
