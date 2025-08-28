import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const uiDir = path.resolve(scriptDir, '../src/app/ui');

process.chdir(uiDir);

const install = spawnSync('pnpm', ['install'], { stdio: 'inherit', shell: true });
if (install.status !== 0) {
  process.exit(install.status ?? 1);
}

const build = spawnSync('pnpm', ['run', 'build'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, BUILD_STANDALONE: 'true' },
});

process.exit(build.status ?? 0);
