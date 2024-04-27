const { join } = require('node:path');
const { readFileSync } = require('node:fs');

const lockfile = join(process.env.GITHUB_WORKSPACE ?? process.cwd(), 'package-lock.json');
const matcher = /.+github\.com\/(?<repo>[\w-]+\/[\w-]+)\.git#(?<hash>[0-9a-f]+)/;

/** @param {import('@actions/core')} core */
function getBody(core) {
  const { packages } = JSON.parse(readFileSync(lockfile, 'utf8'));
  return Object.entries(packages).slice(1).map(([key, value]) => {
    if (value.resolved.startsWith('git')) {
      const match = matcher.exec(value.resolved)
      if (match) {
        // @ts-ignore
        const { repo, hash } = match.groups;
        return `- [${repo}@\`${hash}\`](https://github.com/${repo}/commit/${hash})`;
      } else {
        core.warning(`URL: ${value.resolved}`, { file: lockfile, title: 'Failed to parse URL' })
        return `- ${value.resolved}`;
      }
    }
    const name = key.substring(13), version = value.version;
    return `- [${name}@\`${version}\`](https://www.npmjs.com/package/${name}/v/${version})`;
  }).join('\n');
}

/** @param {import('github-script').AsyncFunctionArguments} */
module.exports = async function({core, exec}) {
  core.summary.addRaw('## Old versions', true);
  core.summary.addRaw(getBody(core), true).addEOL();
  await core.summary.write();
  await exec.exec('npm', ['update']);

  const body = getBody(core);
  core.summary.addRaw('## New versions', true);
  core.summary.addRaw(body, true).addEOL();
  await core.summary.write();
  return body;
}
