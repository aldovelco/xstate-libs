/**
 * This is a minimal script to publish your package to "npm".
 * This is meant to be used as-is or customize as you see fit.
 *
 * This script is executed on "dist/path/to/library" as "cwd" by default.
 *
 * You might need to authenticate with NPM before running this script.
 */

import { readCachedProjectGraph } from '@nrwl/devkit';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

function invariant(condition, message) {
  if (!condition) {
    console.error(chalk.bold.red(message));
    process.exit(1);
  }
}

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath).toString());
  } catch (e) {
    return undefined;
  }
}

// Executing publish script: node path/to/publish.mjs {name} --tag {tag}
// Default "tag" to "next" so we won't publish the "latest" tag by accident.
const [, , name, _tag] = process.argv;

const tag = typeof _tag === 'string' && _tag === 'undefined' ? undefined : _tag;
invariant(tag, `${tag} is not a valid tag. Are you sure you're passing a --tag {tag} argument?`);

const graph = readCachedProjectGraph();
const project = graph.nodes[name];

invariant(project, `Could not find project "${name}" in the workspace. Is the project.json configured correctly?`);

const outputPath = project.data?.targets?.build?.options?.outputPath;
invariant(
  outputPath,
  `Could not find "build.options.outputPath" of project "${name}". Is project.json configured correctly?`
);

// Updating the version in "package.json" before publishing
const packageJson = readJson(`${outputPath}/package.json`);
invariant(packageJson, `Error reading package.json file from library build output.`);

// Make sure version bumps have been handled by changeset
const changesetJson = readJson(`tmp/changeset.json`);
invariant(changesetJson, `Error reading tmp/changeset.json file.`);
const pendingRelease = changesetJson.releases.find((release) => release.name === packageJson.name);
invariant(
  pendingRelease == null,
  `Could not continue the publishing process because there are outstanding changesets.`
);

process.chdir(outputPath);

// A simple SemVer validation to validate the version
const validVersion = /^\d+\.\d+\.\d+(-\w+\.\d+)?/;
invariant(
  packageJson.version && validVersion.test(packageJson.version),
  `No version provided or version did not match Semantic Versioning, expected: #.#.#-tag.# or #.#.#, got ${packageJson.version}.`
);

// Execute "npm publish" to publish
console.log(`Publishing ${packageJson.name}@${packageJson.version} --tag ${tag}`);
execSync(`npm publish --access public --tag ${tag}`);
