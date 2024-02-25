const { join } = require('node:path');
const { readFileSync } = require('node:fs');

const lockfile = join(process.env.GITHUB_WORKSPACE, 'package-lock.json');
const matcher = /.+\/(?<repo>[a-z-]+\/[a-z-]+)\.git#(?<hash>[0-9a-f]+)/;

function getBody() {
  const { packages } = JSON.parse(readFileSync(lockfile, 'utf8'));
  return Object.entries(packages).slice(1).map(([key, value]) => {
    if (value.resolved.startsWith('git')) {
      const { repo, hash } = matcher.exec(value.resolved).groups;
      return `- [${repo}@\`${hash}\`](https://github.com/${repo}/commit/${hash})`;
    }
    const name = key.substring(13), version = value.version;
    return `- [${name}@\`${version}\`](https://www.npmjs.com/package/${name}/v/${version})`;
  }).join('\n');
}

/** @param {import('@types/github-script').AsyncFunctionArguments} */
module.exports = async function({core}) {
  core.summary.addRaw('## Old versions', true);
  core.summary.addRaw(getBody(), true).addEOL();
  await core.summary.write();
  await exec.exec('npm', ['update']);

  const body = getBody();
  core.summary.addRaw('## New versions', true);
  core.summary.addRaw(body, true).addEOL();
  await core.summary.write();
  return body;
}
