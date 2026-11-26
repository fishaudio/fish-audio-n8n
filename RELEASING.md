# Releasing

This repository publishes one npm package, `@fishaudio/n8n-nodes-fishaudio`.

## How a release runs

1. Run the **Node** workflow (`.github/workflows/node.yml`) from `main` with `workflow_dispatch` and a release type (patch, minor or major).
2. `release-it` bumps the version, updates `CHANGELOG.md`, commits, tags and creates the GitHub release.
3. The job builds again, so the published files carry the new version (the User-Agent reads it from the built `package.json`).
4. `npm publish` publishes the package through npm trusted publishing (GitHub OIDC). There is no npm token in the repository. npm adds a provenance statement automatically, which n8n requires for verified community nodes.

The provenance statement names the commit that started the run (`GITHUB_SHA`), not the version-bump commit that `release-it` adds during the run. Both have the same `package.json` name, which is what n8n's scanner looks for in that commit.

## Trusted publisher

On npmjs.com: package → **Settings** → **Trusted publishing** → GitHub Actions.

| Field                | Value                  |
| -------------------- | ---------------------- |
| Organization or user | `fishaudio`            |
| Repository           | `fish-audio-n8n`       |
| Workflow filename    | `node.yml`             |
| Environment          | `release`              |
| Allowed actions      | `npm publish` (ticked) |

New trusted publishers allow only `npm stage publish` by default. The release runs a direct `npm publish`, so tick `npm publish` under **Allowed actions** (with the CLI: `npm trust github … --allow-publish`). npm doesn't check the configuration when you save it: a mistake shows up only when a release publishes. A new configuration expires if no publish uses it within 2 days.

Don't rename `node.yml`, the `release` environment or the repository: the trusted publisher must match them exactly.

## First publish

A trusted publisher can only be added to a package that already exists. So the first version is published once by hand, by a member of the `@fishaudio` npm organization, from the commit that renamed the package, with the same version as the last `n8n-nodes-fishaudio` release:

```bash
git checkout <rename commit>
npm ci
npm run build
npm publish --ignore-scripts
```

`--ignore-scripts` skips `prepublishOnly`, which otherwise stops any publish that doesn't come from `npm run release`. That version has no provenance. Add the trusted publisher shortly before the next release from CI, because it expires if no publish uses it within 2 days. That release has provenance and is the version to submit to n8n.

## The previous package name

Before the rename, the package was published as `n8n-nodes-fishaudio`. It is not published from `main` after the rename. If a serious fix is needed for it before `@fishaudio/n8n-nodes-fishaudio` is verified by n8n, release it from the last `n8n-nodes-fishaudio` tag.

## Checks before a release

```bash
npm ci
npm run lint
npm test
npx @n8n/scan-community-package .
```

CI runs the same checks on every pull request. After a release, run the scanner on the published package, which also checks its provenance and source:

```bash
npx @n8n/scan-community-package @fishaudio/n8n-nodes-fishaudio
```
