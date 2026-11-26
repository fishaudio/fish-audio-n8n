<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/fishaudio/fish-audio-n8n/refs/heads/main/.github/assets/banner-dark.svg" />
  <img alt="Fish Audio n8n Integration" src="https://raw.githubusercontent.com/fishaudio/fish-audio-n8n/refs/heads/main/.github/assets/banner-light.svg" />
</picture>

# Fish Audio for n8n

[![npm version](https://img.shields.io/npm/v/n8n-nodes-fishaudio)](https://www.npmjs.com/package/n8n-nodes-fishaudio)
[![License](https://img.shields.io/github/license/fishaudio/fish-audio-n8n)](https://github.com/fishaudio/fish-audio-n8n/blob/main/LICENSE)

The official n8n community node for [Fish Audio](https://fish.audio): text to speech, speech to text and voice cloning in your n8n workflows.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

> **This node has moved to `@fishaudio/n8n-nodes-fishaudio`,** under the Fish Audio npm organization. `n8n-nodes-fishaudio` keeps working. See [Move from n8n-nodes-fishaudio](#move-from-n8n-nodes-fishaudio).

## Installation

- **Self-hosted n8n:** open **Settings → Community nodes → Install**, enter the package name and confirm. For other ways to install, see n8n's [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).
- **n8n Cloud:** open the nodes panel, search for **Fish Audio** and install it from there. Cloud offers only community nodes that n8n has verified.

## Credentials

1. Create an account at [fish.audio](https://fish.audio).
2. Open [API Keys](https://fish.audio/app/api-keys) and create a key.
3. In n8n, create a **Fish Audio API** credential and paste the key. n8n checks the key when you save.

## Operations

### Speech

| Operation      | Description                                                                                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Generate**   | Convert text to speech. Choose the model (S2.1 Pro is recommended), the voice, the output format (MP3, WAV, PCM or Opus) and options such as speed, volume, bitrate and sample rate. |
| **Transcribe** | Convert speech to text. Choose the model (Transcribe 1 Pro is recommended) and the language, and get timestamps for each segment.                                                    |

Transcribe 1 Pro marks speakers in `text` (for example `<|speaker:0|> Hello`) and returns them in `speaker_turns`.

### Voice Model

| Operation  | Description                             |
| ---------- | --------------------------------------- |
| **List**   | List voice models                       |
| **Get**    | Get the details of a voice model        |
| **Create** | Create a voice model from audio samples |
| **Delete** | Delete a voice model                    |

### Account

| Operation       | Description                   |
| --------------- | ----------------------------- |
| **Get Credits** | Check your API credit balance |

The node can also be used as a tool by n8n's AI Agent.

## Workflow templates

The [`templates`](templates) folder has workflows you can import. In n8n, open a new workflow, select **⋯ → Import → From URL** (**Import from URL** in n8n 1.x) and paste the URL, or download the file and import it from a file. Then select your Fish Audio credential in each Fish Audio node, and publish the workflow (**Active** toggle in n8n 1.x).

| Template                          | What it does                                                                       | Import URL                                                                                              |
| --------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Text to speech API                | A webhook that takes `{"text": "...", "voice_id": "..."}` and returns an MP3 file. | `https://raw.githubusercontent.com/fishaudio/fish-audio-n8n/main/templates/text-to-speech-api.json`     |
| Transcribe an uploaded audio file | A form where people upload a recording and see its transcript.                     | `https://raw.githubusercontent.com/fishaudio/fish-audio-n8n/main/templates/transcribe-audio-form.json`  |
| Re-voice a recording              | A form that transcribes a recording and returns the same words in another voice.   | `https://raw.githubusercontent.com/fishaudio/fish-audio-n8n/main/templates/revoice-recording-form.json` |

The templates use `@fishaudio/n8n-nodes-fishaudio`, version 0.5.0 or later.

## Move from n8n-nodes-fishaudio

`@fishaudio/n8n-nodes-fishaudio` is the same node as `n8n-nodes-fishaudio`, published by Fish Audio's npm organization from this repository.

**Nothing breaks if you wait.** Workflows that use `n8n-nodes-fishaudio` keep working. From version 0.5.0, that node shows a notice at the top of its settings.

- **Self-hosted n8n:** you can switch now.
- **n8n Cloud:** switch once `@fishaudio/n8n-nodes-fishaudio` appears in the nodes panel. Cloud installs only nodes that n8n has verified.

n8n stores the package name in each workflow, so a workflow uses the new package only after its Fish Audio nodes are replaced. Your Fish Audio credential works with both packages, so you don't need to enter the API key again.

### In the editor

This works on any n8n, including n8n Cloud.

1. Install `@fishaudio/n8n-nodes-fishaudio`. Keep `n8n-nodes-fishaudio` installed: both can be installed at the same time.
2. Open a workflow that uses Fish Audio. For each Fish Audio node:
   1. Add a Fish Audio node from the nodes panel and choose the same operation. While both packages are installed, the panel shows two Fish Audio nodes; the one from the previous package shows the notice when you open it.
   2. Select your Fish Audio credential and enter the same parameters as in the old node. Copy the old node's **Settings** tab too (for example Always Output Data, Execute Once, Retry On Fail and On Error), and its notes. If the old node is deactivated, deactivate the new one.
   3. Connect the new node in place of the old one, and delete the old node.
   4. Give the new node the old node's name. Expressions such as `$('Fish Audio')` refer to a node by name.
3. **Publish** the workflow (in n8n 1.x, save it while it is active). Saving alone changes only the draft: the published workflow keeps using the old node until you publish.
4. Run the workflow once to check it.
5. Uninstall `n8n-nodes-fishaudio` only when no workflow uses it **and** no execution that started before your change is still running or waiting (for example at a Wait node or a form). Such an execution continues with the old node when it resumes. Retrying an old execution, or restoring an older workflow version, also needs the old package.

### Many workflows at once, with the CLI (self-hosted)

For instances with many affected workflows. Tested with n8n 2.49. It changes only the workflows that contain a node from `n8n-nodes-fishaudio`, and keeps their node parameters.

What to expect:

- `import:workflow` **unpublishes** every workflow it imports, and step 5 publishes the migrated workflows again. From step 4 until n8n has applied step 5 (up to about 20 seconds in our test with a running n8n), those workflows are offline and their triggers can miss events. Choose a quiet time.
- A workflow whose draft has edits that are not published yet is **not** changed. The command in step 3 lists it, so you can change it in the editor instead. This keeps unpublished edits from being published by accident.
- Don't edit workflows while you do this.

Run the commands where the `n8n` command works (for Docker, through `docker exec`). Node.js is part of every n8n install.

1. Install `@fishaudio/n8n-nodes-fishaudio`, and keep `n8n-nodes-fishaudio` installed.
2. Export all workflows, both drafts and published versions. `workflows-backup.json` is your backup; keep it. If no workflow is published, the second command says so, and you can go on.

   ```bash
   n8n export:workflow --all --output=workflows-backup.json
   n8n export:workflow --all --published --output=workflows-published.json
   ```

3. Prepare the migration. This writes `fishaudio-migrate.json` (the affected workflows, with the new node type) and `fishaudio-publish.txt` (those of them that are published), and lists any workflow to change in the editor instead.

   ```bash
   node -e '
   const fs = require("fs");
   const read = (f) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : []);
   const OLD = "n8n-nodes-fishaudio.";
   const uses = (w) => Boolean(w) && w.nodes.some((n) => n.type.startsWith(OLD));
   const published = new Map(read("workflows-published.json").map((w) => [w.id, w]));
   const migrate = [];
   const inEditor = [];
   for (const w of read("workflows-backup.json")) {
     if (!uses(w) && !uses(published.get(w.id))) continue;
     if (w.activeVersionId && w.activeVersionId !== w.versionId) {
       inEditor.push(w);
       continue;
     }
     for (const n of w.nodes) if (n.type.startsWith(OLD)) n.type = "@fishaudio/" + n.type;
     migrate.push(w);
   }
   const names = (list) => list.map((w) => `${w.id} "${w.name}"`).join(", ") || "none";
   fs.writeFileSync("fishaudio-migrate.json", JSON.stringify(migrate, null, 2));
   fs.writeFileSync("fishaudio-publish.txt", migrate.filter((w) => w.activeVersionId).map((w) => w.id + "\n").join(""));
   console.log("To migrate: " + names(migrate));
   console.log("Change in the editor instead (unpublished edits): " + names(inEditor));
   '
   ```

4. Import the migrated workflows. This unpublishes them.

   ```bash
   n8n import:workflow --input=fishaudio-migrate.json
   ```

5. Publish again the ones that were published. Each command prints either that a running n8n applies the change shortly, or that n8n must be restarted. Do what it says.

   ```bash
   while read -r id; do n8n publish:workflow --id="$id"; done < fishaudio-publish.txt
   ```

6. Check that every one of them is published. This prints the IDs that are not; no output means all are. It checks n8n's database: a running n8n can take a few more seconds to serve the published version.

   ```bash
   n8n list:workflow --active=true --onlyId | sort > published-now.txt
   sort fishaudio-publish.txt | comm -23 - published-now.txt
   ```

   For an ID it prints, run `n8n publish:workflow --id=<ID>` again and read the error.

7. Run each migrated workflow once. For uninstalling `n8n-nodes-fishaudio`, the same rule applies as in step 5 of the editor method.

**To undo**, while `n8n-nodes-fishaudio` is still installed: restore the migrated workflows from the backup, then publish them again and check them as in steps 5 and 6.

```bash
node -e '
const fs = require("fs");
const ids = new Set(JSON.parse(fs.readFileSync("fishaudio-migrate.json", "utf8")).map((w) => w.id));
const restore = JSON.parse(fs.readFileSync("workflows-backup.json", "utf8")).filter((w) => ids.has(w.id));
fs.writeFileSync("fishaudio-restore.json", JSON.stringify(restore, null, 2));
console.log("To restore: " + restore.length);
'
n8n import:workflow --input=fishaudio-restore.json
while read -r id; do n8n publish:workflow --id="$id"; done < fishaudio-publish.txt
```

## Resources

- [Fish Audio](https://fish.audio)
- [Fish Audio API documentation](https://docs.fish.audio)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
