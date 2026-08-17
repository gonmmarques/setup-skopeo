# Set up Skopeo CLI

[repo-actions]: https://github.com/gonmmarques/setup-skopeo/actions
[linter-badge]:
  https://github.com/gonmmarques/setup-skopeo/actions/workflows/linter.yml/badge.svg
[ci-badge]:
  https://github.com/gonmmarques/setup-skopeo/actions/workflows/ci.yml/badge.svg
[dist-badge]:
  https://github.com/gonmmarques/setup-skopeo/actions/workflows/check-dist.yml/badge.svg
[codeql-badge]:
  https://github.com/gonmmarques/setup-skopeo/actions/workflows/codeql-analysis.yml/badge.svg
[coverage-badge]:
  https://raw.githubusercontent.com/gonmmarques/setup-skopeo/main/badges/coverage.svg
[coverage-link]:
  https://github.com/gonmmarques/setup-skopeo/blob/main/badges/coverage.svg
[skopeo]: https://github.com/containers/skopeo
[skopeo-binary]: https://github.com/lework/skopeo-binary
[skopeo-binary-version]:
  https://github.com/lework/skopeo-binary/blob/master/version.txt
[actions-toolkit]: https://github.com/actions/toolkit
[typescript-action]: https://github.com/actions/typescript-action
[upstream-repo]: https://github.com/warjiang/setup-skopeo
[upstream-pr]: https://github.com/warjiang/setup-skopeo/pull/36

[![GitHub Super-Linter][linter-badge]][repo-actions] ![CI][ci-badge]
[![Check dist/][dist-badge]][repo-actions]
[![CodeQL][codeql-badge]][repo-actions]
[![Coverage][coverage-badge]][coverage-link]

This action is a fork of [warjiang/setup-skopeo][upstream-repo]. It was kept
alive because the upstream project was not being updated and released, and this
maintained version keeps the action working and available for use. The original
upstream change that led to this fork is tracked in
[warjiang/setup-skopeo#36][upstream-pr].

Use this action to install and configure the [skopeo][skopeo] CLI so you can
sync images across registries.

## Prerequisites

- Basic knowledge of Docker images and [skopeo][skopeo], a container tool for
  copying and syncing images across registries.
- This action runs using Node 24. If you are using self-hosted GitHub Actions
  runners, use a runner version that supports Node 24 or newer.

## Usage

```yaml
jobs:
  job_id:
    steps:
      - name: 'Set up skopeo'
        uses: gonmmarques/setup-skopeo@v0.2.0
        with:
          version: latest

      - name: 'Sync images'
        run: |
          skopeo --version
          skopeo copy --dest-creds \
          ${{ secrets.DEST_REGISTRY_USER }}:${{ secrets.DEST_REGISTRY_PASSWORD }} \
          docker://alpine:3.24 \
          docker://${{ secrets.DEST_REGISTRY }}/alpine:3.24
```

## Inputs

- `version`: Optional. Set the skopeo version to install. Default: `latest`.
  More information about supported versions can be found in the [skopeo-binary
  version manifest][skopeo-binary-version].

## Why this fork exists

The upstream action was no longer being maintained and released, so this fork
keeps the functionality available for users who still need a working setup
action for skopeo.

## Local validation

This repository uses Husky to enforce local checks before commit and push:

- pre-commit: lint, formatting, and tests
- pre-push: lint, formatting, tests, bundle, and coverage badge refresh

After installing dependencies, the hooks are enabled automatically via the
`prepare` script. If you need to re-enable them manually, run:

```bash
npx husky install
```

## Credits

- [skopeo][skopeo]: the upstream project this action installs and configures.
- [skopeo-binary][skopeo-binary]: generates the binary artifacts used by the
  action.
- [actions/toolkit][actions-toolkit]: utilities used by GitHub Actions.
- [actions/typescript-action][typescript-action]: the template used to bootstrap
  the TypeScript action.
- [warjiang/setup-skopeo][upstream-repo]: the original source this fork is based
  on.
