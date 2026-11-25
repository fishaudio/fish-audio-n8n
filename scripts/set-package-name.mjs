// Switches this repository between the two npm names it is published under.
//
//   node scripts/set-package-name.mjs @fishaudio/n8n-nodes-fishaudio   (default, documented name)
//   node scripts/set-package-name.mjs n8n-nodes-fishaudio              (previous name)
//
// Only `name` in package.json and `node` in the codex file change. The node reads its own
// package name at runtime and shows a "this package has moved" notice when it runs under
// the previous name. Run `npm run build` after switching.
import { readFileSync, writeFileSync } from 'node:fs';

const ALLOWED = ['@fishaudio/n8n-nodes-fishaudio', 'n8n-nodes-fishaudio'];
const name = process.argv[2];
if (!ALLOWED.includes(name)) {
	console.error(`Usage: node scripts/set-package-name.mjs <${ALLOWED.join('|')}>`);
	process.exit(1);
}

// Replace the one field in place so the files keep their formatting.
function setField(path, field, value) {
	const text = readFileSync(path, 'utf8');
	const pattern = new RegExp(`^(\\s*"${field}"\\s*:\\s*)"[^"]*"`, 'm');
	if (!pattern.test(text)) throw new Error(`No "${field}" field in ${path}`);
	writeFileSync(path, text.replace(pattern, `$1${JSON.stringify(value)}`));
}

setField('package.json', 'name', name);
setField('nodes/Fishaudio/Fishaudio.node.json', 'node', name);
console.log(`Package name set to ${name}`);
