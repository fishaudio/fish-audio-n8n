# Releasing

This repository publishes one node under two npm names, from the same source and the same release run:

| npm package                      | Status                                                                                                                                      | Node type in workflows                     |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `@fishaudio/n8n-nodes-fishaudio` | Current name. Documented for new installs.                                                                                                  | `@fishaudio/n8n-nodes-fishaudio.fishaudio` |
| `n8n-nodes-fishaudio`            | Previous name. Still published so that existing workflows keep working and get updates. Its node shows a notice that the package has moved. | `n8n-nodes-fishaudio.fishaudio`            |

n8n stores the package name in every workflow as part of the node type, and has no way to alias one package to another. So both names stay published until the previous name is no longer used.

The two builds differ only in `name` in `package.json` and `node` in `nodes/Fishaudio/Fishaudio.node.json`. `scripts/set-package-name.mjs` switches them. The node reads its own package name (`nodes/Fishaudio/packageInfo.ts`) and adds the notice under the previous name. The repository keeps the current name.

```bash
node scripts/set-package-name.mjs n8n-nodes-fishaudio            # previous name
node scripts/set-package-name.mjs @fishaudio/n8n-nodes-fishaudio  # current name (committed)
npm run build
```

## How a release runs

1. Run the **Node** workflow (`.github/workflows/node.yml`) from `main` with `workflow_dispatch` and a release type (patch, minor or major).
2. `release-it` bumps the version, updates `CHANGELOG.md`, commits, tags and creates the GitHub release.
3. **Publish n8n-nodes-fishaudio**: builds under the previous name and runs `npm publish --provenance`.
4. **Publish @fishaudio/n8n-nodes-fishaudio**: builds under the current name and runs `npm publish --provenance --access public`.

Both publishes use npm trusted publishing (GitHub OIDC). There is no npm token in the repository. n8n requires community nodes to be published from GitHub Actions with provenance.

## Switches (repository variables)

| Variable                   | Default     | Effect                                                                                                                                             |
| -------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PUBLISH_SCOPED_PACKAGE`   | unset (off) | Set to `true` once `@fishaudio/n8n-nodes-fishaudio` exists on npm and has a trusted publisher. While off, releases publish the previous name only. |
| `PUBLISH_PREVIOUS_PACKAGE` | unset (on)  | Set to `false` to stop publishing `n8n-nodes-fishaudio`.                                                                                           |

The scoped publish never fails the release: it has `continue-on-error` and leaves a warning on the run if it fails. It also runs when the previous-name publish fails. To publish a missed version afterwards, check out the release tag and run step 4 by hand from an account with publish rights.

## Trusted publishers

Each package has its own trusted publisher on npmjs.com (package → Settings → Trusted publishing). Both use the same values:

| Field                | Value            |
| -------------------- | ---------------- |
| Publisher            | GitHub Actions   |
| Organization or user | `fishaudio`      |
| Repository           | `fish-audio-n8n` |
| Workflow filename    | `node.yml`       |
| Environment          | `release`        |

Don't rename `node.yml`, the `release` environment or the repository: the trusted publishers match them exactly.

A trusted publisher can only be added to a package that already exists. The first version of `@fishaudio/n8n-nodes-fishaudio` is therefore published once by hand by a member of the `@fishaudio` npm organization, from a clean checkout of the latest release tag (for example `v0.5.0`, so both names carry the same version):

```bash
node scripts/set-package-name.mjs @fishaudio/n8n-nodes-fishaudio
npm ci && npm run build
npm publish --access public --ignore-scripts
```

`--ignore-scripts` skips `prepublishOnly`, which otherwise stops any publish that doesn't come from `npm run release`. The version published this way has no provenance. The next version, published by CI, has provenance, and is the version to submit to n8n.

## Checks before a release

```bash
npm ci
npm run lint && npm run build
npx @n8n/scan-community-package .
node scripts/set-package-name.mjs n8n-nodes-fishaudio && npm run lint && npm run build
npx @n8n/scan-community-package .
node scripts/set-package-name.mjs @fishaudio/n8n-nodes-fishaudio
```

CI runs the same checks on every pull request.

After a release, run n8n's scanner on the published package:

```bash
npx @n8n/scan-community-package @fishaudio/n8n-nodes-fishaudio
```
